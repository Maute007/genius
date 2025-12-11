import { Router, Request, Response, NextFunction } from 'express';
import { Conversation, Message } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CreateMessageInput, UpdateMessageInput, MessageRole } from '../types/api.js';

const router: Router = Router({ mergeParams: true });

const VALID_ROLES: MessageRole[] = ['user', 'assistant'];

function isValidRole(role: string): role is MessageRole {
  return VALID_ROLES.includes(role as MessageRole);
}

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });

    sendSuccess(res, messages);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content, role } = req.body as CreateMessageInput;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      sendError(res, 'Field "content" is required and must be a non-empty string.', 400);
      return;
    }

    if (!role || !isValidRole(role)) {
      sendError(res, `Field "role" is required and must be one of: ${VALID_ROLES.join(', ')}.`, 400);
      return;
    }

    const message = await Message.create({
      conversationId: parseInt(conversationId, 10),
      content: content.trim(),
      role,
    });

    await conversation.update({ updatedAt: new Date() });

    sendSuccess(res, message, 201);
  } catch (error) {
    next(error);
  }
});

router.put('/:messageId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId, messageId } = req.params;
    const { content } = req.body as UpdateMessageInput;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    const message = await Message.findOne({
      where: { id: messageId, conversationId },
    });

    if (!message) {
      sendError(res, 'Message not found.', 404);
      return;
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      sendError(res, 'Field "content" is required and must be a non-empty string.', 400);
      return;
    }

    await message.update({ content: content.trim() });
    sendSuccess(res, message);
  } catch (error) {
    next(error);
  }
});

router.delete('/:messageId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId, messageId } = req.params;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    const message = await Message.findOne({
      where: { id: messageId, conversationId },
    });

    if (!message) {
      sendError(res, 'Message not found.', 404);
      return;
    }

    await message.destroy();
    sendSuccess(res, { message: 'Message deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
