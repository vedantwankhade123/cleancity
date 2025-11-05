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
  AdminRequest,
  InsertAdminRequest,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByCity(city: string): Promise<User[]>;
  getUserAdminsCountByCity(city: string): Promise<number>;

  // Admin secret code operations
  getAdminSecretCode(code: string): Promise<AdminSecretCode | undefined>;
  createAdminSecretCode(
    secretCode: InsertAdminSecretCode,
  ): Promise<AdminSecretCode>;
  markAdminSecretCodeAsUsed(id: number): Promise<boolean>;
  getAllAdminSecretCodes(): Promise<AdminSecretCode[]>;

  // Report operations
  getReport(id: number): Promise<Report | undefined>;
  getReportsByUserId(userId: number): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  getReportsByStatus(status: string): Promise<Report[]>;
  getReportsByCity(city: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(
    id: number,
    statusData: UpdateReportStatus,
  ): Promise<Report | undefined>;
  deleteReport(id: number): Promise<boolean>;

  // Admin request operations
  createAdminRequest(request: InsertAdminRequest): Promise<AdminRequest>;
  getAdminRequestById(id: number): Promise<AdminRequest | undefined>;
  getPendingAdminRequestsByCity(city: string): Promise<AdminRequest[]>;
  updateAdminRequestStatus(id: number, status: "approved" | "rejected"): Promise<AdminRequest | undefined>;
}

// In-memory storage implementation (for reference/testing)
export class MemStorage implements IStorage {
  // ... (in-memory implementation remains unchanged but would need to be updated if used)
  // Note: The project uses DatabaseStorage, so these changes are for interface consistency.
  private adminRequests: Map<number, AdminRequest> = new Map();
  private adminRequestId: number = 1;

  // ... (existing methods)

  async createAdminRequest(request: InsertAdminRequest): Promise<AdminRequest> {
    const id = this.adminRequestId++;
    const newRequest: AdminRequest = {
      ...request,
      id,
      status: 'pending',
      createdAt: new Date(),
    };
    this.adminRequests.set(id, newRequest);
    return newRequest;
  }

  async getAdminRequestById(id: number): Promise<AdminRequest | undefined> {
    return this.adminRequests.get(id);
  }

  async getPendingAdminRequestsByCity(city: string): Promise<AdminRequest[]> {
    return Array.from(this.adminRequests.values()).filter(
      req => req.city === city && req.status === 'pending'
    );
  }

  async updateAdminRequestStatus(id: number, status: "approved" | "rejected"): Promise<AdminRequest | undefined> {
    const request = this.adminRequests.get(id);
    if (request) {
      request.status = status;
      this.adminRequests.set(id, request);
      return request;
    }
    return undefined;
  }
  // ... (rest of MemStorage implementation)
}

// Import database storage
import {
  DatabaseStorage,
  initializeAdminSecretCodes,
} from "./database-storage";

// Use database storage instead of in-memory storage
export const storage = new DatabaseStorage();

// Initialize admin secret codes in the database
initializeAdminSecretCodes().catch((err) => {
  console.error("Failed to initialize admin secret codes:", err);
});