import { Router } from 'express';
import conversationsRouter from './conversations.js';
import messagesRouter from './messages.js';
import profilesRouter from './profiles.js';

const router = Router();

router.use('/conversations', conversationsRouter);
router.use('/conversations/:conversationId/messages', messagesRouter);
router.use('/profiles', profilesRouter);

export default router;
