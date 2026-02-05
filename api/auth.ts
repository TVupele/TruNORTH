/**
 * TruNORTH Authentication API - Vercel Serverless Function
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

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

// Initialize demo user
users.set('demo@trunorth.app', {
  id: 'demo-user-123',
  email: 'demo@trunorth.app',
  password: bcrypt.hashSync('demo123', 12),
  name: 'Demo User',
  language: 'en',
  role: 'member',
  createdAt: new Date()
});

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;

  // Extract path from URL
  const path = url?.replace('/api/auth', '') || '/';

  try {
    // POST /register
    if (method === 'POST' && path === '/register') {
      const data = registerSchema.parse(req.body);
      
      if (users.has(data.email)) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      const hashedPassword = await bcrypt.hash(data.password, 12);
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
      
      const token = jwt.sign(
        { id: userId, email: data.email, role: 'member' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({
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
    }

    // POST /login
    if (method === 'POST' && path === '/login') {
      const data = loginSchema.parse(req.body);
      
      const user = users.get(data.email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
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
    }

    // GET /me
    if (method === 'GET' && path === '/me') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          email: string;
          role: string;
        };
        
        const user = Array.from(users.values()).find(u => u.id === decoded.id);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            language: user.language,
            role: user.role
          }
        });
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // PUT /profile
    if (method === 'PUT' && path === '/profile') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          email: string;
        };
        
        const user = Array.from(users.values()).find(u => u.id === decoded.id);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        if (req.body.name) user.name = req.body.name;
        if (req.body.language) user.language = req.body.language;
        
        return res.json({
          message: 'Profile updated successfully',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            language: user.language,
            role: user.role
          }
        });
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // POST /logout
    if (method === 'POST' && path === '/logout') {
      return res.json({ message: 'Logged out successfully' });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found' });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
