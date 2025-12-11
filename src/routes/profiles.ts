import { Router, Request, Response, NextFunction } from 'express';
import { Profile } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { UpdateProfileInput } from '../types/api.js';

const router: Router = Router();

router.get('/:userId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum)) {
      sendError(res, 'Invalid userId.', 400);
      return;
    }

    let profile = await Profile.findOne({ where: { userId: userIdNum } });

    if (!profile) {
      profile = await Profile.create({ userId: userIdNum });
    }

    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
});

router.put('/:userId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, age, grade, interests, province, onboardingCompleted } = req.body as UpdateProfileInput;
    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum)) {
      sendError(res, 'Invalid userId.', 400);
      return;
    }

    let profile = await Profile.findOne({ where: { userId: userIdNum } });

    if (!profile) {
      profile = await Profile.create({ userId: userIdNum });
    }

    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
      updates.name = typeof name === 'string' ? name.trim() || null : null;
    }

    if (email !== undefined) {
      updates.email = typeof email === 'string' ? email.trim() || null : null;
    }

    if (age !== undefined) {
      updates.age = typeof age === 'number' ? age : null;
    }

    if (grade !== undefined) {
      updates.grade = typeof grade === 'string' ? grade.trim() || null : null;
    }

    if (interests !== undefined) {
      updates.interests = typeof interests === 'string' ? interests : null;
    }

    if (province !== undefined) {
      updates.province = typeof province === 'string' ? province.trim() || null : null;
    }

    if (onboardingCompleted !== undefined) {
      updates.onboardingCompleted = Boolean(onboardingCompleted);
    }

    await profile.update(updates);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
});

export default router;
