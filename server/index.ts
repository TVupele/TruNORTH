/**
 * TruNORTH Server
 * Main Express application entry point
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { logger } from './utils/logger';
import { errorHandler, OperationalError } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import donationsRoutes from './routes/donations';
import emergencyRoutes from './routes/emergency';
import shopRoutes from './routes/shop';
import eventsRoutes from './routes/events';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  throw new OperationalError(`Route ${req.method} ${req.path} not found`, 404);
});

// Global error handler
app.use(errorHandler as unknown as (err: Error, req: Request, res: Response, next: NextFunction) => void);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 TruNORTH Server running on port ${PORT}`);
  logger.info(`📝 API Documentation: http://localhost:${PORT}/api`);
  logger.info(`🔐 Demo credentials: demo@trunorth.app / demo123`);
});

export default app;
