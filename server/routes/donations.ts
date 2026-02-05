/**
 * Donations Routes
 * Handles crowdfunding campaigns and donation management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { asyncHandler, OperationalError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { verifyToken, optionalAuth } from '../middleware/auth';

const router = Router();

// In-memory storage (replace with database in production)
interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  currency: string;
  imageUrl?: string;
  category: 'medical' | 'education' | 'emergency' | 'community' | 'religious';
  creatorId: string;
  creatorName: string;
  status: 'active' | 'completed' | 'cancelled';
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Donation {
  id: string;
  campaignId: string;
  donorId?: string;
  donorName?: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

const campaigns: Map<string, Campaign> = new Map();
const donations: Map<string, Donation> = new Map();

// Initialize demo campaigns
const demoCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    title: 'Help John\'s Medical Treatment',
    description: 'John needs funds for his hospital treatment after an accident. Any contribution will help save a life.',
    targetAmount: 500000,
    raisedAmount: 125000,
    currency: 'NGN',
    category: 'medical',
    creatorId: 'user-1',
    creatorName: 'Mary Johnson',
    status: 'active',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'campaign-2',
    title: 'Community Well Construction',
    description: 'Help us build a new well in the rural community to provide clean water access.',
    targetAmount: 1000000,
    raisedAmount: 450000,
    currency: 'NGN',
    category: 'community',
    creatorId: 'user-2',
    creatorName: 'Community Leader',
    status: 'active',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'campaign-3',
    title: 'Mosque Renovation Fund',
    description: 'Support the renovation of our local mosque to serve the community better.',
    targetAmount: 2000000,
    raisedAmount: 800000,
    currency: 'NGN',
    category: 'religious',
    creatorId: 'user-3',
    creatorName: 'Mosque Committee',
    status: 'active',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

demoCampaigns.forEach(c => campaigns.set(c.id, c));

// Validation schemas
const createCampaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  targetAmount: z.number().positive('Target amount must be positive'),
  category: z.enum(['medical', 'education', 'emergency', 'community', 'religious']),
  deadline: z.string().datetime()
});

const donateSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional().default(false)
});

/**
 * GET /api/donations/campaigns
 * Get all active campaigns
 */
router.get('/campaigns', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const category = req.query.category as string;
  const search = req.query.search as string;
  
  let allCampaigns = Array.from(campaigns.values())
    .filter(c => c.status === 'active');
  
  if (category) {
    allCampaigns = allCampaigns.filter(c => c.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    allCampaigns = allCampaigns.filter(c =>
      c.title.toLowerCase().includes(searchLower) ||
      c.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by most raised first
  allCampaigns.sort((a, b) => b.raisedAmount - a.raisedAmount);
  
  res.json({
    campaigns: allCampaigns.map(c => ({
      ...c,
      progress: Math.min((c.raisedAmount / c.targetAmount) * 100, 100),
      daysLeft: Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }))
  });
}));

/**
 * GET /api/donations/campaigns/:id
 * Get campaign details
 */
router.get('/campaigns/:id', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const campaign = campaigns.get(req.params.id);
  
  if (!campaign) {
    throw new OperationalError('Campaign not found', 404);
  }
  
  // Get campaign donations
  const campaignDonations = Array.from(donations.values())
    .filter(d => d.campaignId === campaign.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
  
  res.json({
    campaign: {
      ...campaign,
      progress: Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100),
      daysLeft: Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    },
    donations: campaignDonations
  });
}));

/**
 * POST /api/donations/campaigns
 * Create a new campaign
 */
router.post('/campaigns', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = createCampaignSchema.parse(req.body);
  
  const campaignId = uuidv4();
  const campaign: Campaign = {
    id: campaignId,
    title: data.title,
    description: data.description,
    targetAmount: data.targetAmount,
    raisedAmount: 0,
    currency: 'NGN',
    category: data.category,
    creatorId: userId,
    creatorName: (req as any).user.name || 'Anonymous',
    status: 'active',
    deadline: new Date(data.deadline),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  campaigns.set(campaignId, campaign);
  
  logger.info(`New campaign created: ${campaignId} by user ${userId}`);
  
  res.status(201).json({
    message: 'Campaign created successfully',
    campaign
  });
}));

/**
 * POST /api/donations/campaigns/:id/donate
 * Donate to a campaign
 */
router.post('/campaigns/:id/donate', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  const data = donateSchema.parse(req.body);
  const userId = (req as any).user?.id;
  
  const campaign = campaigns.get(campaignId);
  
  if (!campaign) {
    throw new OperationalError('Campaign not found', 404);
  }
  
  if (campaign.status !== 'active') {
    throw new OperationalError('Campaign is not accepting donations', 400);
  }
  
  const donationId = uuidv4();
  const donation: Donation = {
    id: donationId,
    campaignId,
    donorId: userId,
    donorName: data.isAnonymous ? undefined : ((req as any).user?.name || 'Anonymous'),
    amount: data.amount,
    currency: 'NGN',
    message: data.message,
    isAnonymous: data.isAnonymous,
    createdAt: new Date()
  };
  
  donations.set(donationId, donation);
  
  // Update campaign raised amount
  campaign.raisedAmount += data.amount;
  campaign.updatedAt = new Date();
  
  // Check if campaign target reached
  if (campaign.raisedAmount >= campaign.targetAmount) {
    campaign.status = 'completed';
    logger.info(`Campaign ${campaignId} target reached!`);
  }
  
  logger.info(`Donation of ${data.amount} to campaign ${campaignId}`);
  
  res.status(201).json({
    message: 'Donation successful. JazaaAllah for your generosity!',
    donation,
    campaign: {
      ...campaign,
      progress: Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)
    }
  });
}));

/**
 * GET /api/donations/my-campaigns
 * Get campaigns created by current user
 */
router.get('/my-campaigns', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const userCampaigns = Array.from(campaigns.values())
    .filter(c => c.creatorId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({
    campaigns: userCampaigns.map(c => ({
      ...c,
      progress: Math.min((c.raisedAmount / c.targetAmount) * 100, 100)
    }))
  });
}));

/**
 * GET /api/donations/my-donations
 * Get donation history for current user
 */
router.get('/my-donations', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const userDonations = Array.from(donations.values())
    .filter(d => d.donorId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Enrich with campaign data
  const enrichedDonations = userDonations.map(d => {
    const campaign = campaigns.get(d.campaignId);
    return {
      ...d,
      campaign: campaign ? { id: campaign.id, title: campaign.title } : null
    };
  });
  
  res.json({ donations: enrichedDonations });
}));

export default router;
