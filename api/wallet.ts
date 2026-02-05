/**
 * TruNORTH Wallet API - Vercel Serverless Function
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage for demo
const wallets: Map<string, {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: Date;
  }>;
}> = new Map();

// Initialize demo wallet
wallets.set('demo-user-123', {
  id: 'wallet-1',
  userId: 'demo-user-123',
  balance: 1000,
  currency: 'USD',
  transactions: [
    {
      id: 'tx-1',
      type: 'deposit',
      amount: 1000,
      description: 'Initial deposit',
      createdAt: new Date()
    }
  ]
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.replace('/api/wallet', '') || '/';

  // Verify auth for protected routes
  const authHeader = req.headers.authorization;
  let userId = 'demo-user-123'; // Default for demo
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { id: string };
      userId = decoded.id;
    } catch {
      // Continue with demo user
    }
  }

  try {
    // GET / - Get wallet balance
    if (method === 'GET' && (path === '/' || path === '')) {
      const wallet = wallets.get(userId);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      return res.json({ wallet });
    }

    // POST /deposit
    if (method === 'POST' && path === '/deposit') {
      const { amount, description } = req.body;
      
      let wallet = wallets.get(userId);
      if (!wallet) {
        wallet = {
          id: `wallet-${userId}`,
          userId,
          balance: 0,
          currency: 'USD',
          transactions: []
        };
        wallets.set(userId, wallet);
      }

      wallet.balance += Number(amount) || 0;
      wallet.transactions.unshift({
        id: `tx-${Date.now()}`,
        type: 'deposit',
        amount: Number(amount) || 0,
        description: description || 'Deposit',
        createdAt: new Date()
      });

      return res.json({ message: 'Deposit successful', wallet });
    }

    // POST /withdraw
    if (method === 'POST' && path === '/withdraw') {
      const { amount, description } = req.body;
      
      const wallet = wallets.get(userId);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      if (wallet.balance < (Number(amount) || 0)) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      wallet.balance -= Number(amount) || 0;
      wallet.transactions.unshift({
        id: `tx-${Date.now()}`,
        type: 'withdraw',
        amount: Number(amount) || 0,
        description: description || 'Withdrawal',
        createdAt: new Date()
      });

      return res.json({ message: 'Withdrawal successful', wallet });
    }

    // GET /transactions
    if (method === 'GET' && path === '/transactions') {
      const wallet = wallets.get(userId);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      return res.json({ transactions: wallet.transactions });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
