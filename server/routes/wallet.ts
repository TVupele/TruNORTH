/**
 * Wallet Routes
 * Handles digital wallet operations: balance, transactions, payments
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { asyncHandler, OperationalError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { verifyToken } from '../middleware/auth';

const router = Router();

// In-memory wallet storage (replace with database in production)
interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const wallets: Map<string, Wallet> = new Map();
const transactions: Map<string, Transaction> = new Map();

// Initialize demo wallet
wallets.set('demo-wallet-123', {
  id: 'demo-wallet-123',
  userId: 'demo-user-123',
  balance: 5000,
  currency: 'NGN',
  isFrozen: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Validation schemas
const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.string(),
  description: z.string().optional()
});

const withdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  bankAccount: z.string(),
  accountName: z.string(),
  accountNumber: z.string()
});

const transferSchema = z.object({
  recipientId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional()
});

/**
 * GET /api/wallet
 * Get wallet balance and details
 */
router.get('/', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  let wallet = Array.from(wallets.values()).find(w => w.userId === userId);
  
  if (!wallet) {
    // Create wallet for new user
    const walletId = uuidv4();
    wallet = {
      id: walletId,
      userId,
      balance: 0,
      currency: 'NGN',
      isFrozen: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    wallets.set(walletId, wallet);
  }
  
  res.json({
    wallet: {
      id: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
      isFrozen: wallet.isFrozen
    }
  });
}));

/**
 * GET /api/wallet/transactions
 * Get wallet transaction history
 */
router.get('/transactions', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const wallet = Array.from(wallets.values()).find(w => w.userId === userId);
  
  if (!wallet) {
    throw new OperationalError('Wallet not found', 404);
  }
  
  const walletTransactions = Array.from(transactions.values())
    .filter(t => t.walletId === wallet.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50); // Last 50 transactions
  
  res.json({ transactions: walletTransactions });
}));

/**
 * POST /api/wallet/deposit
 * Add funds to wallet
 */
router.post('/deposit', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = depositSchema.parse(req.body);
  
  let wallet = Array.from(wallets.values()).find(w => w.userId === userId);
  
  if (!wallet) {
    throw new OperationalError('Wallet not found', 404);
  }
  
  if (wallet.isFrozen) {
    throw new OperationalError('Wallet is frozen', 403);
  }
  
  // Create deposit transaction
  const transactionId = uuidv4();
  const transaction: Transaction = {
    id: transactionId,
    walletId: wallet.id,
    type: 'deposit',
    amount: data.amount,
    currency: wallet.currency,
    status: 'completed',
    description: data.description || 'Wallet deposit',
    metadata: { paymentMethod: data.paymentMethod },
    createdAt: new Date()
  };
  
  transactions.set(transactionId, transaction);
  
  // Update balance
  wallet.balance += data.amount;
  wallet.updatedAt = new Date();
  
  logger.info(`Deposit of ${data.amount} ${wallet.currency} for user ${userId}`);
  
  res.json({
    message: 'Deposit successful',
    transaction,
    newBalance: wallet.balance
  });
}));

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from wallet
 */
router.post('/withdraw', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = withdrawalSchema.parse(req.body);
  
  let wallet = Array.from(wallets.values()).find(w => w.userId === userId);
  
  if (!wallet) {
    throw new OperationalError('Wallet not found', 404);
  }
  
  if (wallet.isFrozen) {
    throw new OperationalError('Wallet is frozen', 403);
  }
  
  if (wallet.balance < data.amount) {
    throw new OperationalError('Insufficient balance', 400);
  }
  
  // Create withdrawal transaction
  const transactionId = uuidv4();
  const transaction: Transaction = {
    id: transactionId,
    walletId: wallet.id,
    type: 'withdrawal',
    amount: -data.amount,
    currency: wallet.currency,
    status: 'pending',
    description: `Withdrawal to ${data.bankAccount}`,
    metadata: {
      bankAccount: data.bankAccount,
      accountName: data.accountName,
      accountNumber: data.accountNumber
    },
    createdAt: new Date()
  };
  
  transactions.set(transactionId, transaction);
  
  // Update balance
  wallet.balance -= data.amount;
  wallet.updatedAt = new Date();
  
  logger.info(`Withdrawal of ${data.amount} ${wallet.currency} for user ${userId}`);
  
  res.json({
    message: 'Withdrawal initiated',
    transaction,
    newBalance: wallet.balance
  });
}));

/**
 * POST /api/wallet/transfer
 * Transfer funds to another user
 */
router.post('/transfer', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = transferSchema.parse(req.body);
  
  let senderWallet = Array.from(wallets.values()).find(w => w.userId === userId);
  let recipientWallet = Array.from(wallets.values()).find(w => w.userId === data.recipientId);
  
  if (!senderWallet) {
    throw new OperationalError('Wallet not found', 404);
  }
  
  if (!recipientWallet) {
    throw new OperationalError('Recipient wallet not found', 404);
  }
  
  if (senderWallet.isFrozen || recipientWallet.isFrozen) {
    throw new OperationalError('Cannot transfer with frozen wallet', 403);
  }
  
  if (senderWallet.balance < data.amount) {
    throw new OperationalError('Insufficient balance', 400);
  }
  
  // Create transactions
  const senderTxId = uuidv4();
  const recipientTxId = uuidv4();
  
  const senderTransaction: Transaction = {
    id: senderTxId,
    walletId: senderWallet.id,
    type: 'transfer_out',
    amount: -data.amount,
    currency: senderWallet.currency,
    status: 'completed',
    description: data.description || 'Transfer to user',
    metadata: { recipientId: data.recipientId },
    createdAt: new Date()
  };
  
  const recipientTransaction: Transaction = {
    id: recipientTxId,
    walletId: recipientWallet.id,
    type: 'transfer_in',
    amount: data.amount,
    currency: recipientWallet.currency,
    status: 'completed',
    description: data.description || 'Transfer from user',
    metadata: { senderId: userId },
    createdAt: new Date()
  };
  
  transactions.set(senderTxId, senderTransaction);
  transactions.set(recipientTxId, recipientTransaction);
  
  // Update balances
  senderWallet.balance -= data.amount;
  senderWallet.updatedAt = new Date();
  
  recipientWallet.balance += data.amount;
  recipientWallet.updatedAt = new Date();
  
  logger.info(`Transfer of ${data.amount} ${senderWallet.currency} from ${userId} to ${data.recipientId}`);
  
  res.json({
    message: 'Transfer successful',
    transaction: senderTransaction,
    newBalance: senderWallet.balance
  });
}));

/**
 * POST /api/wallet/pay
 * Make a payment from wallet
 */
router.post('/pay', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { amount, description, serviceType, serviceId } = req.body;
  
  if (!amount || amount <= 0) {
    throw new OperationalError('Invalid amount', 400);
  }
  
  let wallet = Array.from(wallets.values()).find(w => w.userId === userId);
  
  if (!wallet) {
    throw new OperationalError('Wallet not found', 404);
  }
  
  if (wallet.isFrozen) {
    throw new OperationalError('Wallet is frozen', 403);
  }
  
  if (wallet.balance < amount) {
    throw new OperationalError('Insufficient balance', 400);
  }
  
  // Create payment transaction
  const transactionId = uuidv4();
  const transaction: Transaction = {
    id: transactionId,
    walletId: wallet.id,
    type: 'payment',
    amount: -amount,
    currency: wallet.currency,
    status: 'completed',
    description: description || 'Payment',
    metadata: { serviceType, serviceId },
    createdAt: new Date()
  };
  
  transactions.set(transactionId, transaction);
  
  // Update balance
  wallet.balance -= amount;
  wallet.updatedAt = new Date();
  
  logger.info(`Payment of ${amount} ${wallet.currency} for ${serviceType} by user ${userId}`);
  
  res.json({
    message: 'Payment successful',
    transaction,
    newBalance: wallet.balance
  });
}));

export default router;
