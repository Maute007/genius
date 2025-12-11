import { Router, Request, Response, NextFunction } from 'express';
import { Profile } from '../models';
import { sendSuccess, sendError } from '../utils/response';
import { UpdateProfileInput } from '../types/api';

const router = Router();

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
    const { name, email } = req.body as UpdateProfileInput;
    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum)) {
      sendError(res, 'Invalid userId.', 400);
      return;
    }

    let profile = await Profile.findOne({ where: { userId: userIdNum } });

    if (!profile) {
      profile = await Profile.create({ userId: userIdNum });
    }

    const updates: Partial<UpdateProfileInput> = {};

    if (name !== undefined) {
      if (typeof name !== 'string') {
        sendError(res, 'Field "name" must be a string.', 400);
        return;
      }
      updates.name = name.trim() || null;
    }

    if (email !== undefined) {
      if (typeof email !== 'string') {
        sendError(res, 'Field "email" must be a string.', 400);
        return;
      }
      updates.email = email.trim() || null;
    }

    await profile.update(updates);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
});

export default router;
