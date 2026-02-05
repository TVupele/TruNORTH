/**
 * TruNORTH Events API - Vercel Serverless Function
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Demo events
const events: Array<{
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  attendees: number;
}> = [
  {
    id: 'e1',
    title: 'Community Gathering',
    description: 'Monthly community gathering with food and networking',
    date: '2024-03-15T18:00:00Z',
    location: 'Main Hall',
    category: 'Community',
    attendees: 45
  },
  {
    id: 'e2',
    title: 'Youth Workshop',
    description: 'Skills workshop for youth members',
    date: '2024-03-20T14:00:00Z',
    location: 'Conference Room A',
    category: 'Education',
    attendees: 20
  },
  {
    id: 'e3',
    title: 'Fundraising Gala',
    description: 'Annual fundraising dinner event',
    date: '2024-04-01T19:00:00Z',
    location: 'Grand Ballroom',
    category: 'Fundraising',
    attendees: 150
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.replace('/api/events', '') || '/';

  try {
    // GET / - List events
    if (method === 'GET' && (path === '/' || path === '')) {
      return res.json({ events });
    }

    // GET /:id - Get event
    if (method === 'GET' && path.startsWith('/') && path.split('/')[1] && !path.includes('?')) {
      const id = path.split('/')[1];
      const event = events.find(e => e.id === id);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json({ event });
    }

    // POST / - Create event
    if (method === 'POST' && (path === '/' || path === '')) {
      const { title, description, date, location, category } = req.body;
      
      const event = {
        id: `e${Date.now()}`,
        title: title || 'New Event',
        description: description || '',
        date: date || new Date().toISOString(),
        location: location || 'TBD',
        category: category || 'General',
        attendees: 0
      };
      
      events.unshift(event);
      
      return res.status(201).json({ message: 'Event created', event });
    }

    // POST /:id/register - Register for event
    if (method === 'POST' && path.includes('/register')) {
      const id = path.split('/')[1];
      const event = events.find(e => e.id === id);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      event.attendees++;
      
      return res.json({ message: 'Registered successfully', event });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
