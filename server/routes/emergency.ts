/**
 * Emergency Routes
 * Handles emergency reporting, alerts, and disaster management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { asyncHandler, OperationalError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { verifyToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Types
interface EmergencyReport {
  id: string;
  type: 'medical' | 'fire' | 'crime' | 'accident' | 'natural_disaster' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  reporterId?: string;
  reporterName?: string;
  status: 'pending' | 'dispatched' | 'resolved' | 'cancelled';
  assignedTo?: string;
  responders: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface EmergencyAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory' | 'info';
  title: string;
  message: string;
  affectedAreas: string[];
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

// In-memory storage
const reports: Map<string, EmergencyReport> = new Map();
const alerts: Map<string, EmergencyAlert> = new Map();

// Initialize demo alerts
const demoAlerts: EmergencyAlert[] = [
  {
    id: 'alert-1',
    type: 'info',
    title: 'COVID-19 Guidelines',
    message: 'Remember to follow health guidelines. Wash hands regularly and wear masks in crowded places.',
    affectedAreas: ['All Areas'],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'alert-2',
    type: 'advisory',
    title: 'Weather Advisory',
    message: 'Heavy rainfall expected in the northern region. Avoid unnecessary travel.',
    affectedAreas: ['Kano', 'Kaduna', ' Katsina'],
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date()
  }
];

demoAlerts.forEach(a => alerts.set(a.id, a));

// Validation schemas
const reportEmergencySchema = z.object({
  type: z.enum(['medical', 'fire', 'crime', 'accident', 'natural_disaster', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const createAlertSchema = z.object({
  type: z.enum(['warning', 'watch', 'advisory', 'info']),
  title: z.string().min(3),
  message: z.string().min(10),
  affectedAreas: z.array(z.string()),
  expiresInHours: z.number().positive().optional().default(24)
});

// Hotlines (Nigeria)
const HOTLINES = {
  police: '112',
  fire: '112',
  ambulance: '112',
  nsprc: '0805-9000-999', // National Emergency Number
  trunorth: '0700-TRUNORTH'
};

/**
 * GET /api/emergency/hotlines
 * Get emergency hotlines
 */
router.get('/hotlines', (req: Request, res: Response) => {
  res.json({ hotlines: HOTLINES });
});

/**
 * GET /api/emergency/alerts
 * Get active emergency alerts
 */
router.get('/alerts', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const activeAlerts = Array.from(alerts.values())
    .filter(a => a.isActive && new Date(a.expiresAt) > new Date())
    .sort((a, b) => {
      // Sort by severity (warning > watch > advisory > info)
      const severityOrder = { warning: 0, watch: 1, advisory: 2, info: 3 };
      return severityOrder[a.type] - severityOrder[b.type];
    });
  
  res.json({ alerts: activeAlerts });
}));

/**
 * POST /api/emergency/alerts
 * Create emergency alert (admin only)
 */
router.post('/alerts', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (user.role !== 'admin') {
    throw new OperationalError('Admin access required', 403);
  }
  
  const data = createAlertSchema.parse(req.body);
  
  const alertId = uuidv4();
  const alert: EmergencyAlert = {
    id: alertId,
    type: data.type,
    title: data.title,
    message: data.message,
    affectedAreas: data.affectedAreas,
    expiresAt: new Date(Date.now() + (data.expiresInHours || 24) * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date()
  };
  
  alerts.set(alertId, alert);
  
  logger.warn(`New emergency alert: ${alert.title} (${alert.type})`);
  
  res.status(201).json({
    message: 'Alert created successfully',
    alert
  });
}));

/**
 * GET /api/emergency/reports
 * Get all reports (admin) or my reports (user)
 */
router.get('/reports', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const status = req.query.status as string;
  
  let userReports = Array.from(reports.values());
  
  if (user.role !== 'admin') {
    userReports = userReports.filter(r => r.reporterId === user.id);
  }
  
  if (status) {
    userReports = userReports.filter(r => r.status === status);
  }
  
  // Sort by most recent
  userReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({ reports: userReports });
}));

/**
 * GET /api/emergency/reports/:id
 * Get single report details
 */
router.get('/reports/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const report = reports.get(req.params.id);
  
  if (!report) {
    throw new OperationalError('Report not found', 404);
  }
  
  res.json({ report });
}));

/**
 * POST /api/emergency/report
 * Report an emergency
 */
router.post('/report', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const data = reportEmergencySchema.parse(req.body);
  const user = (req as any).user;
  
  const reportId = uuidv4();
  const report: EmergencyReport = {
    id: reportId,
    type: data.type,
    severity: data.severity,
    title: data.title,
    description: data.description,
    location: {
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude
    },
    reporterId: user?.id,
    reporterName: user?.name,
    status: 'pending',
    responders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  reports.set(reportId, report);
  
  // Log critical emergencies
  if (data.severity === 'critical') {
    logger.error(`CRITICAL EMERGENCY REPORTED: ${report.title} (${report.type})`);
  } else {
    logger.warn(`Emergency report created: ${report.title} (${report.severity})`);
  }
  
  res.status(201).json({
    message: 'Emergency report submitted. Help is on the way!',
    reportId,
    emergencyNumber: HOTLINES.nsprc
  });
}));

/**
 * PUT /api/emergency/reports/:id/status
 * Update report status (admin/dispatcher)
 */
router.put('/reports/:id/status', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status, assignedTo } = req.body;
  
  if (user.role !== 'admin' && user.role !== 'dispatcher') {
    throw new OperationalError('Dispatcher access required', 403);
  }
  
  const report = reports.get(req.params.id);
  
  if (!report) {
    throw new OperationalError('Report not found', 404);
  }
  
  const validStatuses = ['pending', 'dispatched', 'resolved', 'cancelled'];
  if (status && validStatuses.includes(status)) {
    report.status = status;
  }
  
  if (assignedTo) {
    report.assignedTo = assignedTo;
  }
  
  report.updatedAt = new Date();
  
  logger.info(`Report ${report.id} status updated to ${report.status}`);
  
  res.json({
    message: 'Status updated',
    report
  });
}));

/**
 * POST /api/emergency/reports/:id/respond
 * Respond to emergency (admin only)
 */
router.post('/reports/:id/respond', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (user.role !== 'admin' && user.role !== 'responder') {
    throw new OperationalError('Responder access required', 403);
  }
  
  const report = reports.get(req.params.id);
  
  if (!report) {
    throw new OperationalError('Report not found', 404);
  }
  
  if (!report.responders.includes(user.id)) {
    report.responders.push(user.id);
  }
  
  if (report.status === 'pending') {
    report.status = 'dispatched';
    report.assignedTo = user.id;
  }
  
  report.updatedAt = new Date();
  
  logger.info(`User ${user.id} responding to emergency ${report.id}`);
  
  res.json({
    message: 'Responding to emergency',
    report
  });
}));

/**
 * GET /api/emergency/sos
 * SOS - Get quick emergency numbers and send alert
 */
router.post('/sos', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { latitude, longitude } = req.body;
  
  // Create SOS report
  const reportId = uuidv4();
  const report: EmergencyReport = {
    id: reportId,
    type: 'medical',
    severity: 'critical',
    title: 'SOS Emergency Alert',
    description: 'User triggered SOS alert',
    location: {
      latitude,
      longitude
    },
    reporterId: user?.id,
    reporterName: user?.name || 'Anonymous',
    status: 'pending',
    responders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  reports.set(reportId, report);
  
  logger.error(`SOS TRIGGERED by user ${user?.id || 'anonymous'} at ${latitude}, ${longitude}`);
  
  res.status(201).json({
    message: 'Emergency services contacted!',
    reportId,
    emergencyNumber: HOTLINES.nsprc,
    instructions: [
      'Stay calm',
      'Stay on the line with emergency services',
      'If possible, move to a safe location',
      'Keep your phone charged'
    ]
  });
}));

export default router;
