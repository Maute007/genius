import { Router, Request, Response, NextFunction } from 'express';
import { Conversation, Message } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CreateConversationInput, UpdateConversationInput, ConversationMode } from '../types/api.js';

const router = Router();

const VALID_MODES: ConversationMode[] = ['quick_doubt', 'exam_prep', 'revision', 'free_learning'];

function isValidMode(mode: string): mode is ConversationMode {
  return VALID_MODES.includes(mode as ConversationMode);
}

router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversations = await Conversation.findAll({
      order: [['updatedAt', 'DESC']],
    });
    sendSuccess(res, conversations);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    sendSuccess(res, conversation);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, mode } = req.body as CreateConversationInput;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      sendError(res, 'Field "title" is required and must be a non-empty string.', 400);
      return;
    }

    if (!mode || !isValidMode(mode)) {
      sendError(res, `Field "mode" is required and must be one of: ${VALID_MODES.join(', ')}.`, 400);
      return;
    }

    const conversation = await Conversation.create({
      title: title.trim(),
      mode,
    });

    sendSuccess(res, conversation, 201);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, mode } = req.body as UpdateConversationInput;

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    const updates: Partial<UpdateConversationInput> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        sendError(res, 'Field "title" must be a non-empty string.', 400);
        return;
      }
      updates.title = title.trim();
    }

    if (mode !== undefined) {
      if (!isValidMode(mode)) {
        sendError(res, `Field "mode" must be one of: ${VALID_MODES.join(', ')}.`, 400);
        return;
      }
      updates.mode = mode;
    }

    await conversation.update(updates);
    sendSuccess(res, conversation);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    await Message.destroy({ where: { conversationId: id } });
    await conversation.destroy();

    sendSuccess(res, { message: 'Conversation deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
