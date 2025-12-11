import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { Session, Profile } from '../models/index.js';

const successResponse = <T>(data: T) => ({ success: true, data });
const errorResponse = (error: string) => ({ success: false, error });

const router: Router = Router();

const SESSION_DURATION_DAYS = 15;

function generateUserId(email: string): number {
  return Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 1000000) + 1;
}

function generateToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json(errorResponse('Email e senha são obrigatórios'));
      return;
    }

    const userId = generateUserId(email);
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    await Session.destroy({ where: { userId } });

    const session = await Session.create({
      userId,
      token,
      expiresAt,
    });

    let profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      profile = await Profile.create({ userId, email });
    }

    res.json(successResponse({
      user: {
        id: String(userId),
        name: email.split('@')[0],
        email,
        onboardingCompleted: profile.onboardingCompleted,
      },
      token: session.token,
      expiresAt: session.expiresAt,
    }));
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json(errorResponse('Erro ao fazer login'));
  }
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json(errorResponse('Email e senha são obrigatórios'));
      return;
    }

    if (password.length < 6) {
      res.status(400).json(errorResponse('Senha deve ter pelo menos 6 caracteres'));
      return;
    }

    const userId = generateUserId(email);
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    const existingProfile = await Profile.findOne({ where: { userId } });
    if (existingProfile && existingProfile.onboardingCompleted) {
      res.status(400).json(errorResponse('Conta já existe. Faça login.'));
      return;
    }

    const profile = existingProfile || await Profile.create({ userId, email });

    await Session.destroy({ where: { userId } });
    const session = await Session.create({
      userId,
      token,
      expiresAt,
    });

    res.json(successResponse({
      user: {
        id: String(userId),
        name: email.split('@')[0],
        email,
        onboardingCompleted: profile.onboardingCompleted,
      },
      token: session.token,
      expiresAt: session.expiresAt,
    }));
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json(errorResponse('Erro ao criar conta'));
  }
});

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await Session.destroy({ where: { token } });
    }
    res.json(successResponse({ message: 'Logout realizado com sucesso' }));
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    res.status(500).json(errorResponse('Erro ao fazer logout'));
  }
});

router.get('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(errorResponse('Token não fornecido'));
      return;
    }

    const token = authHeader.substring(7);
    const session = await Session.findOne({ where: { token } });

    if (!session) {
      res.status(401).json(errorResponse('Sessão inválida'));
      return;
    }

    if (session.isExpired()) {
      await session.destroy();
      res.status(401).json(errorResponse('Sessão expirada'));
      return;
    }

    const profile = await Profile.findOne({ where: { userId: session.userId } });

    res.json(successResponse({
      valid: true,
      user: {
        id: String(session.userId),
        name: profile?.name || profile?.email?.split('@')[0] || 'Estudante',
        email: profile?.email,
        onboardingCompleted: profile?.onboardingCompleted || false,
      },
      expiresAt: session.expiresAt,
    }));
  } catch (error) {
    console.error('[Auth] Validate error:', error);
    res.status(500).json(errorResponse('Erro ao validar sessão'));
  }
});

export default router;
