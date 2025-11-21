import { 
  users, type User, type InsertUser,
  referrals, type Referral, type InsertReferral,
  rewards, type Reward, type InsertReward,
  campaigns, type Campaign, type InsertCampaign,
  notifications, type Notification, type InsertNotification,
  payments, type Payment, type InsertPayment
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { db } from "./db";
import { eq, and, lte, gte, isNull, desc, or } from "drizzle-orm";

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
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return results[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return results[0];
  }
  
  async getUserByUid(uid: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return results[0];
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Referral operations
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(insertReferral).returning();
    return referral;
  }
  
  async getReferral(id: number): Promise<Referral | undefined> {
    const results = await db.select().from(referrals).where(eq(referrals.id, id)).limit(1);
    return results[0];
  }
  
  async getReferralsByReferrerId(referrerId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }
  
  async updateReferralStatus(id: number, status: string, refereeId?: number): Promise<Referral | undefined> {
    const updates: Partial<Referral> = { status };
    
    if (status === 'converted') {
      updates.convertedAt = new Date();
    }
    
    if (refereeId) {
      updates.refereeId = refereeId;
    }
    
    const [updatedReferral] = await db.update(referrals)
      .set(updates)
      .where(eq(referrals.id, id))
      .returning();
    
    return updatedReferral;
  }
  
  async listReferrals(): Promise<Referral[]> {
    return await db.select().from(referrals);
  }
  
  // Reward operations
  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db.insert(rewards).values(insertReward).returning();
    return reward;
  }
  
  async getReward(id: number): Promise<Reward | undefined> {
    const results = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
    return results[0];
  }
  
  async getRewardsByUserId(userId: number): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId));
  }
  
  async updateRewardStatus(id: number, status: string): Promise<Reward | undefined> {
    const updates: Partial<Reward> = { status };
    
    if (status === 'approved') {
      updates.approvedAt = new Date();
    } else if (status === 'paid') {
      updates.paidAt = new Date();
    }
    
    const [updatedReward] = await db.update(rewards)
      .set(updates)
      .where(eq(rewards.id, id))
      .returning();
    
    return updatedReward;
  }
  
  async listRewards(): Promise<Reward[]> {
    return await db.select().from(rewards);
  }
  
  // Campaign operations
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const results = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return results[0];
  }
  
  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updatedCampaign] = await db.update(campaigns)
      .set(data)
      .where(eq(campaigns.id, id))
      .returning();
    
    return updatedCampaign;
  }
  
  async listActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();
    return await db.select().from(campaigns).where(
      and(
        eq(campaigns.isActive, true),
        lte(campaigns.startDate, now),
        or(
          isNull(campaigns.endDate),
          gte(campaigns.endDate, now)
        )
      )
    );
  }
  
  async listCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }
  
  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
  }
  
  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    const results = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return results[0];
  }
  
  async getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined> {
    const results = await db.select().from(payments)
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
      .limit(1);
    return results[0];
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const updates: Partial<Payment> = { status };
    
    if (status === 'succeeded') {
      updates.processedAt = new Date();
    }
    
    const [updatedPayment] = await db.update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment;
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }
}

// Initialize admin user in database if not exists
async function initializeAdminUser() {
  const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
  
  if (adminUser.length === 0) {
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update('adminpassword').digest('hex');
    
    await db.insert(users).values({
      username: "admin",
      email: "admin@taxstats.com",
      password: hashedPassword,
      displayName: "Admin User",
      role: "recruiter",
      isAdmin: true,
      referralCode: "ADMIN123"
    });
    console.log('Admin user created');
  }
}

// Initialize the database with admin user
initializeAdminUser().catch(console.error);

export const storage = new DatabaseStorage();
