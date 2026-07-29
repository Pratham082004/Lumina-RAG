import { Request, Response, NextFunction } from 'express';
import prisma from '../database';

export const getUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required' });
      return;
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { title } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const newSession = await prisma.chatSession.create({
      data: {
        userId,
        title: title || 'New Chat'
      }
    });

    res.status(201).json({
      success: true,
      data: newSession
    });
  } catch (error) {
    next(error);
  }
};

export const addMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { role, content, sources } = req.body;

    if (!sessionId || !role || !content) {
      res.status(400).json({ success: false, message: 'Session ID, role, and content are required' });
      return;
    }

    const newMessage = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role,
        content,
        sources: sources ? sources : null
      }
    });

    // Update the session's updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};
