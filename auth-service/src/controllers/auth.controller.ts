import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
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
          profileImage: user.profileImage
        },
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: 'local',
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // If user signed up with Google and has no password, they should use Google login
    if (!user.password) {
      res.status(401).json({ success: false, message: 'Please sign in with Google' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage
        },
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};
