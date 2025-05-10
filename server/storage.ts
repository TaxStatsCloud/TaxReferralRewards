import { 
  users, type User, type InsertUser,
  referrals, type Referral, type InsertReferral,
  rewards, type Reward, type InsertReward,
  campaigns, type Campaign, type InsertCampaign,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferral(id: number): Promise<Referral | undefined>;
  getReferralsByReferrerId(referrerId: number): Promise<Referral[]>;
  updateReferralStatus(id: number, status: string, refereeId?: number): Promise<Referral | undefined>;
  listReferrals(): Promise<Referral[]>;
  
  // Reward operations
  createReward(reward: InsertReward): Promise<Reward>;
  getReward(id: number): Promise<Reward | undefined>;
  getRewardsByUserId(userId: number): Promise<Reward[]>;
  updateRewardStatus(id: number, status: string): Promise<Reward | undefined>;
  listRewards(): Promise<Reward[]>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined>;
  listActiveCampaigns(): Promise<Campaign[]>;
  listCampaigns(): Promise<Campaign[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private referrals: Map<number, Referral>;
  private rewards: Map<number, Reward>;
  private campaigns: Map<number, Campaign>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private referralIdCounter: number;
  private rewardIdCounter: number;
  private campaignIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.referrals = new Map();
    this.rewards = new Map();
    this.campaigns = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.referralIdCounter = 1;
    this.rewardIdCounter = 1;
    this.campaignIdCounter = 1;
    this.notificationIdCounter = 1;
    
    // Add default admin user
    this.createUser({
      uid: "admin123",
      username: "admin",
      email: "admin@taxstats.com",
      password: "adminpassword", // Should be hashed in a real app
      displayName: "Admin User",
      role: "recruiter",
      isAdmin: true,
      referralCode: "ADMIN123"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.uid === uid,
    );
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Referral operations
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = this.referralIdCounter++;
    const now = new Date();
    const referral: Referral = {
      ...insertReferral,
      id,
      createdAt: now,
      convertedAt: null
    };
    this.referrals.set(id, referral);
    return referral;
  }
  
  async getReferral(id: number): Promise<Referral | undefined> {
    return this.referrals.get(id);
  }
  
  async getReferralsByReferrerId(referrerId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === referrerId,
    );
  }
  
  async updateReferralStatus(id: number, status: string, refereeId?: number): Promise<Referral | undefined> {
    const referral = await this.getReferral(id);
    if (!referral) return undefined;
    
    const updates: Partial<Referral> = { status };
    
    if (status === 'converted') {
      updates.convertedAt = new Date();
    }
    
    if (refereeId) {
      updates.refereeId = refereeId;
    }
    
    const updatedReferral = { ...referral, ...updates };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }
  
  async listReferrals(): Promise<Referral[]> {
    return Array.from(this.referrals.values());
  }
  
  // Reward operations
  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.rewardIdCounter++;
    const now = new Date();
    const reward: Reward = {
      ...insertReward,
      id,
      createdAt: now,
      approvedAt: null,
      paidAt: null
    };
    this.rewards.set(id, reward);
    return reward;
  }
  
  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }
  
  async getRewardsByUserId(userId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.userId === userId,
    );
  }
  
  async updateRewardStatus(id: number, status: string): Promise<Reward | undefined> {
    const reward = await this.getReward(id);
    if (!reward) return undefined;
    
    const updates: Partial<Reward> = { status };
    
    if (status === 'approved') {
      updates.approvedAt = new Date();
    } else if (status === 'paid') {
      updates.paidAt = new Date();
    }
    
    const updatedReward = { ...reward, ...updates };
    this.rewards.set(id, updatedReward);
    return updatedReward;
  }
  
  async listRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }
  
  // Campaign operations
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const now = new Date();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: now
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = await this.getCampaign(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...data };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  async listActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.isActive && 
                     campaign.startDate <= now && 
                     (!campaign.endDate || campaign.endDate >= now)
    );
  }
  
  async listCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }
  
  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: now
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const userNotifications = await this.getNotificationsByUserId(userId);
    
    for (const notification of userNotifications) {
      if (!notification.isRead) {
        await this.markNotificationAsRead(notification.id);
      }
    }
  }
}

export const storage = new MemStorage();
