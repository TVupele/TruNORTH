/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { asyncHandler, OperationalError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  language: z.string().optional().default('en')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// In-memory storage for demo (replace with database in production)
const users: Map<string, {
  id: string;
  email: string;
  password: string;
  name: string;
  language: string;
  role: string;
  createdAt: Date;
}> = new Map();

// Demo user
users.set('demo@trunorth.app', {
  id: 'demo-user-123',
  email: 'demo@trunorth.app',
  password: bcrypt.hashSync('demo123', 12),
  name: 'Demo User',
  language: 'en',
  role: 'member',
  createdAt: new Date()
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  
  // Check if user exists
  if (users.has(data.email)) {
    throw new OperationalError('Email already registered', 400);
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);
  
  // Create user
  const userId = uuidv4();
  const user = {
    id: userId,
    email: data.email,
    password: hashedPassword,
    name: data.name,
    language: data.language,
    role: 'member',
    createdAt: new Date()
  };
  
  users.set(data.email, user);
  
  // Generate token
  const token = jwt.sign(
    { id: userId, email: data.email, role: 'member' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  logger.info(`New user registered: ${data.email}`);
  
  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: userId,
      email: data.email,
      name: data.name,
      language: data.language,
      role: 'member'
    },
    token
  });
}));

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  
  const user = users.get(data.email);
  
  if (!user) {
    throw new OperationalError('Invalid email or password', 401);
  }
  
  const isValidPassword = await bcrypt.compare(data.password, user.password);
  
  if (!isValidPassword) {
    throw new OperationalError('Invalid email or password', 401);
  }
  
  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  logger.info(`User logged in: ${user.email}`);
  
  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
      role: user.role
    },
    token
  });
}));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new OperationalError('Authentication required', 401);
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      email: string;
      role: string;
    };
    
    // Find user by email (demo)
    const user = Array.from(users.values()).find(u => u.id === decoded.id);
    
    if (!user) {
      throw new OperationalError('User not found', 404);
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
        role: user.role
      }
    });
  } catch (error) {
    throw new OperationalError('Invalid token', 401);
  }
}));

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new OperationalError('Authentication required', 401);
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      email: string;
    };
    
    const user = Array.from(users.values()).find(u => u.id === decoded.id);
    
    if (!user) {
      throw new OperationalError('User not found', 404);
    }
    
    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.language) user.language = req.body.language;
    
    logger.info(`Profile updated for user: ${user.email}`);
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
        role: user.role
      }
    });
  } catch (error) {
    throw new OperationalError('Invalid token', 401);
  }
}));

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
}));

export default router;
