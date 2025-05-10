import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertReferralSchema, 
  insertRewardSchema, 
  insertCampaignSchema, 
  insertNotificationSchema 
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import MemoryStore from 'memorystore';

const SessionStore = MemoryStore(session);

// Helper function to generate a random referral code
function generateReferralCode(username: string): string {
  const randomString = uuidv4().substring(0, 6);
  return `${username.substring(0, 4)}${randomString}`.toUpperCase();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'taxstats-refer2earn-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Configure Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        
        if (user.password !== password) { // In a real app, use bcrypt to compare passwords
          return done(null, false, { message: 'Incorrect password' });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Authentication Middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };

  // Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username) 
                          || await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      // Generate referral code if not provided
      if (!userData.referralCode) {
        userData.referralCode = generateReferralCode(userData.username);
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error during login after registration' });
        }
        return res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isAdmin: user.isAdmin,
          referralCode: user.referralCode
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isAdmin: user.isAdmin,
      referralCode: user.referralCode
    });
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/session', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isAdmin: user.isAdmin,
        referralCode: user.referralCode
      });
    }
    res.status(401).json({ message: 'Not authenticated' });
  });

  // User Routes
  app.get('/api/users/me', isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isAdmin: user.isAdmin,
      referralCode: user.referralCode
    });
  });
  
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isAdmin: user.isAdmin,
        referralCode: user.referralCode,
        createdAt: user.createdAt
      })));
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Referral Routes
  app.post('/api/referrals', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const referralData = insertReferralSchema.parse({
        ...req.body,
        referrerId: user.id
      });
      
      const referral = await storage.createReferral(referralData);
      res.status(201).json(referral);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/referrals/me', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const referrals = await storage.getReferralsByReferrerId(user.id);
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/referrals', isAdmin, async (req, res) => {
    try {
      const referrals = await storage.listReferrals();
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.patch('/api/referrals/:id/status', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, refereeId } = req.body;
      
      const validStatus = z.enum(['pending', 'signed_up', 'converted', 'cancelled']).parse(status);
      
      const updatedReferral = await storage.updateReferralStatus(
        Number(id), 
        validStatus, 
        refereeId ? Number(refereeId) : undefined
      );
      
      if (!updatedReferral) {
        return res.status(404).json({ message: 'Referral not found' });
      }
      
      // If referral is converted, create a reward
      if (validStatus === 'converted' && !updatedReferral.rewardApproved) {
        const rewardAmount = 50; // In a real app, calculate based on campaign rules
        
        const reward = await storage.createReward({
          userId: updatedReferral.referrerId,
          referralId: updatedReferral.id,
          amount: rewardAmount,
          status: 'pending'
        });
        
        // Update referral to include reward amount and mark as approved
        await storage.updateReferralStatus(updatedReferral.id, 'converted');
        
        // Create notification for the referrer
        await storage.createNotification({
          userId: updatedReferral.referrerId,
          type: 'reward_earned',
          content: `You've earned a reward of $${rewardAmount} for a successful referral!`,
          isRead: false
        });
      }
      
      res.json(updatedReferral);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid status', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Referral Link Registration
  app.post('/api/register/via-referral', async (req, res) => {
    try {
      const { referralCode, ...userData } = req.body;
      
      // Validate user data
      const parsedUserData = insertUserSchema.parse(userData);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(parsedUserData.username) 
                           || await storage.getUserByEmail(parsedUserData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      // Find referrer by code
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: 'Invalid referral code' });
      }
      
      // Generate referral code for the new user
      if (!parsedUserData.referralCode) {
        parsedUserData.referralCode = generateReferralCode(parsedUserData.username);
      }
      
      // Create the user
      const user = await storage.createUser(parsedUserData);
      
      // Create a referral record
      const referral = await storage.createReferral({
        referrerId: referrer.id,
        refereeId: user.id,
        refereeEmail: user.email,
        status: 'signed_up'
      });
      
      // Create notification for the referrer
      await storage.createNotification({
        userId: referrer.id,
        type: 'referral_used',
        content: `${user.displayName || user.username} has signed up using your referral link!`,
        isRead: false
      });
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error during login after registration' });
        }
        return res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isAdmin: user.isAdmin,
          referralCode: user.referralCode,
          referredBy: referrer.username
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Reward Routes
  app.get('/api/rewards/me', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const rewards = await storage.getRewardsByUserId(user.id);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/rewards', isAdmin, async (req, res) => {
    try {
      const rewards = await storage.listRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.patch('/api/rewards/:id/status', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatus = z.enum(['pending', 'approved', 'rejected', 'paid']).parse(status);
      
      const updatedReward = await storage.updateRewardStatus(Number(id), validStatus);
      
      if (!updatedReward) {
        return res.status(404).json({ message: 'Reward not found' });
      }
      
      // If reward is approved, create a notification
      if (validStatus === 'approved' || validStatus === 'paid') {
        await storage.createNotification({
          userId: updatedReward.userId,
          type: 'status_changed',
          content: `Your reward of $${updatedReward.amount} has been ${validStatus}!`,
          isRead: false
        });
      }
      
      res.json(updatedReward);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid status', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Campaign Routes
  app.post('/api/campaigns', isAdmin, async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/campaigns/active', isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.listActiveCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/campaigns', isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.listCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.patch('/api/campaigns/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const campaignData = req.body;
      
      const updatedCampaign = await storage.updateCampaign(Number(id), campaignData);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Notification Routes
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const notifications = await storage.getNotificationsByUserId(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as any;
      
      const notification = await storage.markNotificationAsRead(Number(id));
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      if (notification.userId !== user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/notifications/read-all', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Analytics Routes
  app.get('/api/analytics/summary', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const referrals = await storage.getReferralsByReferrerId(user.id);
      const rewards = await storage.getRewardsByUserId(user.id);
      
      const totalReferrals = referrals.length;
      const successfulReferrals = referrals.filter(r => r.status === 'converted').length;
      const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up').length;
      
      const totalRewardsAmount = rewards
        .filter(r => r.status === 'approved' || r.status === 'paid')
        .reduce((sum, reward) => sum + reward.amount, 0);
      
      res.json({
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        rewardsEarned: totalRewardsAmount,
        rewardsFormatted: `$${totalRewardsAmount.toFixed(2)}`
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/analytics/admin', isAdmin, async (req, res) => {
    try {
      const referrals = await storage.listReferrals();
      const rewards = await storage.listRewards();
      const users = await storage.listUsers();
      
      const totalUsers = users.length;
      const totalReferrals = referrals.length;
      const successfulReferrals = referrals.filter(r => r.status === 'converted').length;
      const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up').length;
      
      const totalRewardsAmount = rewards
        .filter(r => r.status === 'approved' || r.status === 'paid')
        .reduce((sum, reward) => sum + reward.amount, 0);
      
      const pendingRewardsAmount = rewards
        .filter(r => r.status === 'pending')
        .reduce((sum, reward) => sum + reward.amount, 0);
      
      res.json({
        totalUsers,
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        totalRewardsAmount,
        pendingRewardsAmount,
        conversionRate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
