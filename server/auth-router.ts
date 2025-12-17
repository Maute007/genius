/**
 * Authentication Router - Password-based login
 * Allows users to login with email/phone + password
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { sendVerificationEmail } from "./_core/emailService";

function getVerificationUrl(token: string): string {
  // Usa BASE_URL se existir, senão tenta detectar porta do servidor
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${base}/verify-email?token=${token}`;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authRouter = router({
  /**
   * Register new user with password
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      // Validate that at least email or phone is provided
      if (!input.email && !input.phone) {
        throw new Error("Fornece email ou número de telefone");
      }

      // Check if user already exists
      const identifier = input.email || input.phone!;
      const existingUser = await db.getUserByEmailOrPhone(identifier);
      
      if (existingUser) {
        throw new Error("Já existe uma conta com este email ou telefone. Queres entrar na tua conta existente? Clica em 'Entrar' abaixo.");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user with unique openId
      const openId = `local_${identifier}_${Date.now()}`;
      
      // Generate verification token (for future use)
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Check if this is the first user
      const isFirst = await db.isFirstUser();
      
      const user = await db.createUser({
        openId,
        name: input.name,
        email: input.email,
        password: hashedPassword,
        emailVerified: true, // Auto-verify for development - no email verification needed
        verificationToken,
        loginMethod: "password",
        role: isFirst ? "super_admin" : "user", // First user becomes super_admin
        plan: isFirst ? "family" : "free", // First user gets best plan
      });

      // Create default profile for new user
      await db.createProfile({
        userId: user.id,
        fullName: input.name,
        age: 18, // Default
        grade: "Ensino Secundário",
        interests: ["Estudos"],
        schoolName: "A definir",
        schoolType: "self_learner",
        province: "A definir",
        city: "A definir",
        onboardingCompleted: false,
      });

      // Email verification disabled for development
      console.log(`✅ Utilizador criado sem verificação de email: ${input.email || input.phone}`);

      // Generate JWT token for auto-login (15 days)
      const token = jwt.sign(
        { 
          userId: user.id, 
          openId: user.openId,
          role: user.role,
          plan: user.plan,
        },
        JWT_SECRET,
        { expiresIn: "15d" }
      );

      return {
        success: true,
        message: "Conta criada com sucesso! Podes entrar agora.",
        requiresVerification: false,
        user: {
          id: user.id.toString(),
          name: user.name || "",
          email: user.email || "",
          role: user.role,
          plan: user.plan,
        },
        token, // Auto-login after registration
      };
    }),

  /**
   * Login with password
   */
  login: publicProcedure
    .input(
      z.object({
        identifier: z.string(), // email or phone
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Find user by email or phone
      const user = await db.getUserByEmailOrPhone(input.identifier);

      if (!user) {
        throw new Error("Não encontrámos nenhuma conta com este email ou telefone. Tens a certeza que já criaste uma conta? Se não, clica em 'Criar conta' abaixo.");
      }

      if (!user.password) {
        throw new Error("Esta conta foi criada com Google ou Facebook. Queres entrar com o mesmo método que usaste antes?");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.password);

      if (!isValidPassword) {
        throw new Error("A senha que inseriste não está correcta. Tens a certeza que é esta a senha? Lembra-te que maiúsculas e minúsculas fazem diferença.");
      }

      // Generate JWT token (15 days)
      const token = jwt.sign(
        { 
          userId: user.id, 
          openId: user.openId,
          role: user.role,
          plan: user.plan,
        },
        JWT_SECRET,
        { expiresIn: "15d" }
      );

      // Update last signed in
      await db.updateUserLastSignedIn(user.id);

      // Ensure user has a profile (for existing users created before profile auto-creation)
      const profile = await db.getProfileByUserId(user.id);
      if (!profile) {
        await db.createProfile({
          userId: user.id,
          fullName: user.name || "Utilizador",
          age: 18,
          grade: "Ensino Secundário",
          interests: ["Estudos"],
          schoolName: "A definir",
          schoolType: "self_learner",
          province: "A definir",
          city: "A definir",
          onboardingCompleted: false,
        });
        console.log(`✅ Profile criado para utilizador existente: ${user.email}`);
      }

      return {
        user: {
          id: user.id.toString(),
          name: user.name || "",
          email: user.email || "",
          role: user.role,
          plan: user.plan,
        },
        token,
        message: "Login efetuado com sucesso!",
      };
    }),

  /**
   * Set password for existing OAuth user
   */
  setPassword: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Update user password
      await db.updateUserPassword(input.userId, hashedPassword);

      return {
        message: "Senha configurada com sucesso! Agora podes fazer login com email/telefone + senha.",
      };
    }),

  /**
   * Verify email with token
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Find user by verification token
      const user = await db.getUserByVerificationToken(input.token);

      if (!user) {
        throw new Error("Token de verificação inválido ou expirado");
      }

      if (user.emailVerified) {
        // Already verified, just return token for auto-login (15 days)
        const token = jwt.sign(
          { userId: user.id, openId: user.openId },
          JWT_SECRET,
          { expiresIn: "15d" }
        );

        return {
          user,
          token,
          message: "E-mail já verificado! Bem-vindo de volta.",
        };
      }

      // Mark email as verified and clear token
      await db.verifyUserEmail(user.id);

      // Generate JWT token for auto-login (15 days)
      const token = jwt.sign(
        { userId: user.id, openId: user.openId },
        JWT_SECRET,
        { expiresIn: "15d" }
      );

      return {
        user,
        token,
        message: "E-mail verificado com sucesso! Bem-vindo ao Genius!",
      };
    }),

  /**
   * Verify JWT token
   */
  verifyToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, JWT_SECRET) as {
          userId: number;
          openId: string;
        };

        const user = await db.getUserById(decoded.userId);

        if (!user) {
          throw new Error("Utilizador não encontrado");
        }

        return {
          valid: true,
          user,
        };
      } catch (error) {
        return {
          valid: false,
          user: null,
        };
      }
    }),

  /**
   * Resend verification email
   */
  resendVerificationEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // Find user by email
      const user = await db.getUserByEmailOrPhone(input.email);

      if (!user) {
        throw new Error("Utilizador não encontrado com este email");
      }

      if (user.emailVerified) {
        throw new Error("Este email já foi verificado");
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with new token
      await db.updateUserVerificationToken(user.id, verificationToken);

      // Send verification email (resend)

  const verificationUrl = getVerificationUrl(verificationToken);

      // Try to send real email
      const emailSent = await sendVerificationEmail(input.email, verificationUrl);

      if (emailSent) {
        console.log(`✅ Email de verificação REENVIADO para: ${input.email}`);
      } else {
        console.log(`❌ Falha ao reenviar email, usando console como backup:`);
        console.log(`[Auth] NEW Verification URL: ${verificationUrl}`);
      }

      return {
        success: true,
        message: "Email de verificação reenviado! Verifica a tua caixa de entrada.",
      };
    }),
});

