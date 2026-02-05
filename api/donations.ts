/**
 * TruNORTH Donations API - Vercel Serverless Function
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for demo
const donations: Array<{
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  cause: string;
  createdAt: Date;
}> = [
  {
    id: 'don-1',
    donorId: 'demo-user-123',
    donorName: 'Demo User',
    amount: 100,
    cause: 'Community Outreach Program',
    createdAt: new Date()
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.replace('/api/donations', '') || '/';

  try {
    // GET / - List all donations
    if (method === 'GET' && (path === '/' || path === '')) {
      return res.json({ donations });
    }

    // POST / - Create donation
    if (method === 'POST' && (path === '/' || path === '')) {
      const { donorId, donorName, amount, cause } = req.body;
      
      const donation = {
        id: `don-${Date.now()}`,
        donorId: donorId || 'anonymous',
        donorName: donorName || 'Anonymous',
        amount: Number(amount) || 0,
        cause: cause || 'General Fund',
        createdAt: new Date()
      };
      
      donations.unshift(donation);
      
      return res.status(201).json({ message: 'Donation received', donation });
    }

    // GET /causes
    if (method === 'GET' && path === '/causes') {
      const causes = [
        { id: 'c1', name: 'Community Outreach Program', goal: 5000, raised: 2500 },
        { id: 'c2', name: 'Youth Education Initiative', goal: 10000, raised: 3500 },
        { id: 'c3', name: 'Emergency Relief Fund', goal: 15000, raised: 8000 }
      ];
      return res.json({ causes });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
