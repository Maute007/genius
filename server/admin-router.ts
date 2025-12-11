/**
 * Admin Router - Super Admin management endpoints
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Middleware para verificar se é super_admin
function requireSuperAdmin(user: any) {
  if (user.role !== "super_admin") {
    throw new Error("Acesso negado. Apenas super administradores podem acessar esta funcionalidade.");
  }
}

export const adminRouter = router({
  // Get all users (super_admin only)
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    requireSuperAdmin(ctx.user);
    
    const users = await db.getAllUsers();
    return users;
  }),

  // Update user role (super_admin only)
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "super_admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireSuperAdmin(ctx.user);

      // Não pode alterar seu próprio role
      if (input.userId === ctx.user.id) {
        throw new Error("Você não pode alterar seu próprio nível de acesso.");
      }

      await db.updateUserRole(input.userId, input.role);

      return {
        success: true,
        message: "Nível de acesso atualizado com sucesso!",
      };
    }),

  // Update user plan (super_admin only)
  updateUserPlan: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        plan: z.enum(["free", "student", "student_plus", "family"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireSuperAdmin(ctx.user);

      await db.updateUserPlan(input.userId, input.plan);

      return {
        success: true,
        message: "Plano atualizado com sucesso!",
      };
    }),

  // Get user statistics
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    requireSuperAdmin(ctx.user);

    const allUsers = await db.getAllUsers();

    const stats = {
      total: allUsers.length,
      byPlan: {
        free: allUsers.filter((u) => u.plan === "free").length,
        student: allUsers.filter((u) => u.plan === "student").length,
        student_plus: allUsers.filter((u) => u.plan === "student_plus").length,
        family: allUsers.filter((u) => u.plan === "family").length,
      },
      byRole: {
        user: allUsers.filter((u) => u.role === "user").length,
        admin: allUsers.filter((u) => u.role === "admin").length,
        super_admin: allUsers.filter((u) => u.role === "super_admin").length,
      },
      verified: allUsers.filter((u) => u.emailVerified).length,
      active: allUsers.filter((u) => u.subscriptionStatus === "active").length,
    };

    return stats;
  }),

  // Delete user (super_admin only)
  deleteUser: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireSuperAdmin(ctx.user);

      // Não pode deletar a si mesmo
      if (input.userId === ctx.user.id) {
        throw new Error("Você não pode deletar sua própria conta.");
      }

      // TODO: Implementar deleteUser no db.ts
      throw new Error("Funcionalidade de exclusão ainda não implementada");
    }),
});
