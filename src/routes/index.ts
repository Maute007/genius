import { Router } from 'express';
import conversationsRouter from './conversations.js';
import messagesRouter from './messages.js';
import profilesRouter from './profiles.js';
import chatRouter from './chat.js';
import authRouter from './auth.js';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/conversations', conversationsRouter);
router.use('/conversations/:conversationId/messages', messagesRouter);
router.use('/profiles', profilesRouter);
router.use('/chat', chatRouter);

export default router;
