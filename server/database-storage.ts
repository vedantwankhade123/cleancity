import {
  users,
  User,
  InsertUser,
  adminSecretCodes,
  AdminSecretCode,
  InsertAdminSecretCode,
  reports,
  Report,
  InsertReport,
  UpdateReportStatus,
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, like, inArray } from "drizzle-orm";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        ...user,
        email: user.email.toLowerCase(),
        role: user.role || "user",
        isActive: true,
        rewardPoints: 0,
      })
      .returning();
    
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByCity(city: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(like(users.city, `%${city}%`));
  }

  async getUserAdminsCountByCity(city: string): Promise<number> {
    const result = await db
      .select({ count: users.id })
      .from(users)
      .where(
        and(
          like(users.city, `%${city}%`),
          eq(users.role, "admin")
        )
      );
    return result.length;
  }

  // Admin secret code operations
  async getAdminSecretCode(code: string): Promise<AdminSecretCode | undefined> {
    const result = await db
      .select()
      .from(adminSecretCodes)
      .where(eq(adminSecretCodes.code, code));
    return result[0];
  }

  async createAdminSecretCode(
    secretCode: InsertAdminSecretCode
  ): Promise<AdminSecretCode> {
    const result = await db
      .insert(adminSecretCodes)
      .values(secretCode)
      .returning();
    return result[0];
  }

  async markAdminSecretCodeAsUsed(id: number): Promise<boolean> {
    const result = await db
      .update(adminSecretCodes)
      .set({ isUsed: true })
      .where(eq(adminSecretCodes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllAdminSecretCodes(): Promise<AdminSecretCode[]> {
    return await db.select().from(adminSecretCodes);
  }

  // Report operations
  async getReport(id: number): Promise<Report | undefined> {
    const result = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    return result[0];
  }

  async getReportsByUserId(userId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId));
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports);
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.status, status));
  }

  async getReportsByCity(city: string): Promise<Report[]> {
    const usersInCity = await this.getUsersByCity(city);
    const userIds = usersInCity.map((user) => user.id);
    
    if (userIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(reports)
      .where(inArray(reports.userId, userIds));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const result = await db
      .insert(reports)
      .values({
        ...report,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async updateReportStatus(
    id: number,
    statusData: UpdateReportStatus
  ): Promise<Report | undefined> {
    const result = await db
      .update(reports)
      .set({
        ...statusData,
        updatedAt: new Date(),
        completedAt: statusData.status === "completed" ? new Date() : undefined,
      })
      .where(eq(reports.id, id))
      .returning();
    return result[0];
  }

  async deleteReport(id: number): Promise<boolean> {
    const result = await db.delete(reports).where(eq(reports.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

// Initialize admin secret codes in the database
export async function initializeAdminSecretCodes() {
  const existingCodes = await db.select().from(adminSecretCodes);

  // Only add default codes if none exist
  if (existingCodes.length === 0) {
    console.log("Initializing admin secret codes for Maharashtra...");

    // Add default admin secret codes for cities in Maharashtra
    const maharashtraCities = [
      "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur",
      "Amravati", "Kolhapur", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur",
      "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna"
    ];

    const defaultCodes = maharashtraCities.map(city => ({
      code: `CLEAN_${city.toUpperCase().replace(/\s/g, '_')}`,
      city: city
    }));

    for (const codeData of defaultCodes) {
      await db.insert(adminSecretCodes).values({ ...codeData, isUsed: false });
    }

    console.log("Admin secret codes for Maharashtra initialized successfully");
  }
}