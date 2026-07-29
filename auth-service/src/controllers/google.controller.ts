import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ success: false, message: 'No Google token provided' });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: 'Invalid Google token' });
      return;
    }
    
    const { email, name, sub: googleId, picture } = payload;
    
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create new user if they don't exist
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          profileImage: picture,
          provider: 'google',
          providerId: googleId,
          isVerified: true, // Google accounts are already verified
        }
      });
    } else if (!user.providerId) {
      // Link Google account to existing email account
      user = await prisma.user.update({
        where: { email },
        data: {
          provider: 'google',
          providerId: googleId,
          isVerified: true,
        }
      });
    }
    
    // Generate JWTs
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Save refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
    
    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          onboardingCompleted: user.onboardingCompleted,
          jobTitle: user.jobTitle,
          company: user.company,
          investmentStyle: user.investmentStyle
        },
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};
