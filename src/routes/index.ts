import { Router } from 'express';
import conversationsRouter from './conversations';
import messagesRouter from './messages';
import profilesRouter from './profiles';

const router = Router();

router.use('/conversations', conversationsRouter);
router.use('/conversations/:conversationId/messages', messagesRouter);
router.use('/profiles', profilesRouter);

export default router;
