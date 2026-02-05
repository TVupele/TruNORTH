/**
 * TruNORTH Emergency API - Vercel Serverless Function
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for demo
const emergencies: Array<{
  id: string;
  type: string;
  description: string;
  location: string;
  status: string;
  createdAt: Date;
}> = [
  {
    id: 'em-1',
    type: 'Medical',
    description: 'Need immediate medical assistance',
    location: 'Main Hall',
    status: 'pending',
    createdAt: new Date()
  }
];

const emergencyContacts = [
  { id: 'c1', name: 'Campus Security', phone: '555-0100', available: '24/7' },
  { id: 'c2', name: 'Campus Health Center', phone: '555-0101', available: '24/7' },
  { id: 'c3', name: 'Fire Department', phone: '555-0102', available: '24/7' },
  { id: 'c4', name: 'Police', phone: '555-0103', available: '24/7' }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.replace('/api/emergency', '') || '/';

  try {
    // GET / - List emergencies
    if (method === 'GET' && (path === '/' || path === '')) {
      return res.json({ emergencies });
    }

    // POST / - Report emergency
    if (method === 'POST' && (path === '/' || path === '')) {
      const { type, description, location } = req.body;
      
      const emergency = {
        id: `em-${Date.now()}`,
        type: type || 'General',
        description: description || '',
        location: location || 'Unknown',
        status: 'pending',
        createdAt: new Date()
      };
      
      emergencies.unshift(emergency);
      
      return res.status(201).json({ message: 'Emergency reported', emergency });
    }

    // GET /contacts
    if (method === 'GET' && path === '/contacts') {
      return res.json({ contacts: emergencyContacts });
    }

    // PUT /:id/status
    if (method === 'PUT' && path.startsWith('/')) {
      const id = path.split('/')[1];
      const { status } = req.body;
      
      const emergency = emergencies.find(e => e.id === id);
      if (!emergency) {
        return res.status(404).json({ error: 'Emergency not found' });
      }
      
      emergency.status = status || emergency.status;
      
      return res.json({ message: 'Status updated', emergency });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
