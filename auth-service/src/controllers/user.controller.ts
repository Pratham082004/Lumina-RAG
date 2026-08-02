import { Request, Response, NextFunction } from 'express';
import prisma from '../database';

export const getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const sessionsCount = await prisma.chatSession.count({
      where: { userId }
    });

    const queriesCount = await prisma.message.count({
      where: {
        role: 'user',
        chatSession: {
          userId
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalQueries: queriesCount,
        activeSessions: sessionsCount,
        planStatus: 'Pro'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, jobTitle, company, investmentStyle } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        jobTitle,
        company,
        investmentStyle,
        onboardingCompleted: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          onboardingCompleted: updatedUser.onboardingCompleted,
          jobTitle: updatedUser.jobTitle,
          company: updatedUser.company,
          investmentStyle: updatedUser.investmentStyle
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
