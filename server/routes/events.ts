/**
 * Events & Ticketing Routes
 * Handles events, ticket purchases, and management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { asyncHandler, OperationalError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { verifyToken, optionalAuth } from '../middleware/auth';

const router = Router();

interface Event {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  ticketPrice: number;
  currency: string;
  capacity: number;
  ticketsSold: number;
  isOnline: boolean;
  onlineUrl?: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled' | 'refunded';
  purchasedAt: Date;
}

const events: Map<string, Event> = new Map();
const tickets: Map<string, Ticket> = new Map();

const now = new Date();
const demoData = [
  { id: 'event-1', organizerId: 'org-1', organizerName: 'Kano Chamber', title: 'Trade Expo 2024', description: 'Annual trade exhibition', category: 'business', venue: 'Kano Trade Fair Complex', startDate: new Date(now.getTime() + 14 * 86400000), endDate: new Date(now.getTime() + 16 * 86400000), ticketPrice: 5000, capacity: 1000, ticketsSold: 245, isOnline: false, status: 'upcoming' as const },
  { id: 'event-2', organizerId: 'org-2', organizerName: 'Islamic Center', title: 'Ramadan Workshop', description: 'Learn about Ramadan preparation', category: 'religious', venue: 'Central Mosque Hall', startDate: new Date(now.getTime() + 7 * 86400000), endDate: new Date(now.getTime() + 7 * 86400000), ticketPrice: 0, capacity: 500, ticketsSold: 120, isOnline: false, status: 'upcoming' as const },
  { id: 'event-3', organizerId: 'org-3', organizerName: 'Tech Startups', title: 'Hausa Tech Summit', description: 'Virtual tech conference', category: 'technology', venue: 'Online', startDate: new Date(now.getTime() + 21 * 86400000), endDate: new Date(now.getTime() + 21 * 86400000), ticketPrice: 1000, capacity: 2000, ticketsSold: 450, isOnline: true, onlineUrl: 'https://zoom.us/j/123', status: 'upcoming' as const }
];

demoData.forEach(d => {
  events.set(d.id, { ...d, imageUrl: '', currency: 'NGN', createdAt: now });
});

router.get('/categories', (_req: Request, res: Response) => {
  res.json({ categories: ['religious', 'business', 'technology', 'entertainment', 'education', 'sports', 'health', 'community', 'other'] });
});

router.get('/', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const allEvents = Array.from(events.values()).filter(e => e.status !== 'cancelled' && e.status !== 'completed');
  res.json({ events: allEvents.map(e => ({ ...e, availableTickets: e.capacity - e.ticketsSold, isSoldOut: e.ticketsSold >= e.capacity })) });
}));

router.get('/:id', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const event = events.get(req.params.id);
  if (!event) throw new OperationalError('Event not found', 404);
  res.json({ event: { ...event, availableTickets: event.capacity - event.ticketsSold, isSoldOut: event.ticketsSold >= event.capacity } });
}));

router.post('/', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const eventId = uuidv4();
  const event: Event = {
    id: eventId, organizerId: user.id, organizerName: user.name || 'Unknown',
    title: req.body.title, description: req.body.description, category: req.body.category,
    venue: req.body.venue, address: req.body.address, startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate), ticketPrice: req.body.ticketPrice || 0,
    currency: 'NGN', capacity: req.body.capacity, ticketsSold: 0,
    isOnline: req.body.isOnline || false, onlineUrl: req.body.onlineUrl, status: 'upcoming', createdAt: new Date()
  };
  events.set(eventId, event);
  res.status(201).json({ message: 'Event created', event });
}));

router.post('/:id/tickets', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const event = events.get(req.params.id);
  if (!event) throw new OperationalError('Event not found', 404);
  const quantity = req.body.quantity || 1;
  if (event.ticketsSold + quantity > event.capacity) throw new OperationalError('Not enough tickets', 400);
  
  const ticket: Ticket = {
    id: uuidv4(), eventId: event.id, eventTitle: event.title, userId: user.id, userName: user.name,
    ticketType: 'General', quantity, totalPrice: event.ticketPrice * quantity,
    qrCode: `TRUNORTH-${event.id}-${Date.now()}`, status: 'valid', purchasedAt: new Date()
  };
  tickets.set(ticket.id, ticket);
  event.ticketsSold += quantity;
  res.status(201).json({ message: 'Ticket purchased', ticket });
}));

router.get('/my-tickets', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ tickets: Array.from(tickets.values()).filter(t => t.userId === user.id) });
}));

export default router;
