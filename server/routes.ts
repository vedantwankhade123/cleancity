import { Express, Request, Response, Router } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  insertReportSchema, 
  updateReportStatusSchema
} from "@shared/schema";
import airQualityRouter from "./routes/air-quality";
import { ZodError } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Define session data structure
declare module "express-session" {
  interface SessionData {
    userId: number;
    role: string;
    city: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStoreSession = MemoryStore(session);
  
  // Session middleware
  app.use(
    session({
      cookie: { 
        maxAge: 86400000, // 24 hours
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production' // Set to true in production with HTTPS
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: true,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "clean-city-secret",
      name: 'cleanCity.sid' // Custom name to avoid default connect.sid
    })
  );
  
  // Debug middleware to log all requests and session info
  app.use((req, res, next) => {
    console.log(`Request ${req.method} ${req.url} - Session:`, req.session);
    next();
  });
  
  // Helper function to handle zod validation
  const validateRequest = <T>(schema: z.ZodType<T>, data: any): { success: boolean; data?: T; error?: string } => {
    try {
      const validData = schema.parse(data);
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, error: error.errors.map(e => e.message).join(', ') };
      }
      return { success: false, error: 'Invalid data format' };
    }
  };

  // Auth middleware to protect routes
  const requireAuth = (req: Request, res: Response, next: Function) => {
    console.log("requireAuth middleware - Session:", req.session);
    if (!req.session.userId) {
      console.log("requireAuth: No userId in session, returning 401");
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("requireAuth: User is authenticated, proceeding");
    next();
  };

  // Admin middleware to protect admin routes
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId || req.session.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // API routes
  const apiRouter = Router();
  app.use('/api', apiRouter);

  // Air quality route
  apiRouter.use('/air-quality', airQualityRouter);

  // Auth routes
  // --------------------

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    const validation = validateRequest(insertUserSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    const userData = validation.data!;
    
    try {
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // For admin registration
      if (userData.role === "admin") {
        // Validate secret code
        if (!userData.secretCode) {
          return res.status(400).json({ message: "Secret code is required for admin registration" });
        }
        
        const secretCode = await storage.getAdminSecretCode(userData.secretCode);
        if (!secretCode) {
          return res.status(403).json({ message: "Authorization failed. Please enter a valid secret code or sign up as a user." });
        }
        
        if (secretCode.isUsed) {
          return res.status(400).json({ message: "Secret code has already been used" });
        }
        
        // Ensure city matches secret code city
        if (secretCode.city.toLowerCase() !== userData.city.toLowerCase()) {
          return res.status(400).json({ message: "Secret code is not valid for this city" });
        }
        
        // Check admin limit (2 per city)
        const adminCount = await storage.getUserAdminsCountByCity(userData.city);
        if (adminCount >= 2) {
          return res.status(400).json({ message: "Maximum number of admins reached for this city" });
        }
        
        // Mark secret code as used
        await storage.markAdminSecretCodeAsUsed(secretCode.id);
      }
      
      // Hash password before creating user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userWithHashedPassword = { ...userData, password: hashedPassword };
      
      // Create user
      const user = await storage.createUser(userWithHashedPassword);
      
      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.city = user.city;
      
      // Return user data excluding password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // User login
  app.post("/api/auth/login", async (req, res) => {
    const validation = validateRequest(loginSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    const { email, password, role } = validation.data!;
    
    try {
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.role !== role) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is disabled" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.city = user.city;
      
      // Return user data excluding password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // User logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    console.log("GET /api/auth/me - Session:", req.session);
    
    if (!req.session.userId) {
      console.log("No userId in session, returning 401");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      console.log("Fetching user with ID:", req.session.userId);
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        console.log("User not found in database, destroying session");
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user data excluding password
      const { password, ...userWithoutPassword } = user;
      console.log("User found, returning data:", { 
        id: userWithoutPassword.id, 
        email: userWithoutPassword.email,
        role: userWithoutPassword.role 
      });
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });
  
  // Report routes
  // -------------
  
  // Get all reports (filtered by user role)
  app.get("/api/reports", requireAuth, async (req, res) => {
    try {
      let reports;
      
      // If admin, get all reports or filter by city
      if (req.session.role === "admin") {
        reports = await storage.getReportsByCity(req.session.city || "");
      } else {
        // Regular users can only see their own reports
        reports = await storage.getReportsByUserId(req.session.userId || 0);
      }
      
      res.json(reports);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  
  // Get a specific report by ID
  app.get("/api/reports/:id", requireAuth, async (req, res) => {
    const reportId = parseInt(req.params.id);
    
    if (isNaN(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }
    
    try {
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Regular users can only access their own reports
      if (req.session.role !== "admin" && report.userId !== (req.session.userId || 0)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Get report error:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });
  
  // Create a new report
  app.post("/api/reports", requireAuth, async (req, res) => {
    console.log("Received report data:", req.body);
    console.log("User session:", { userId: req.session.userId, role: req.session.role });
    
    // Validate the request
    const validation = validateRequest(insertReportSchema, req.body);
    
    if (!validation.success) {
      console.log("Validation failed:", validation.error);
      return res.status(400).json({ message: validation.error });
    }
    
    const reportData = validation.data!;
    console.log("Validated report data:", reportData);
    
    try {
      // Assign current user as the report owner
      const report = await storage.createReport({
        ...reportData,
        userId: req.session.userId || 0
      });
      
      console.log("Report created successfully:", report.id);
      res.status(201).json(report);
    } catch (error) {
      console.error("Create report error:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });
  
  // Update report status (admin only)
  app.patch("/api/reports/:id/status", requireAdmin, async (req, res) => {
    const reportId = parseInt(req.params.id);
    
    if (isNaN(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }
    
    const validation = validateRequest(updateReportStatusSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    const statusData = validation.data!;
    
    try {
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      const updatedReport = await storage.updateReportStatus(reportId, {
        ...statusData,
        adminNotes: statusData.adminNotes || report.adminNotes || undefined
      });
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Update report status error:", error);
      res.status(500).json({ message: "Failed to update report status" });
    }
  });
  
  // User management routes (admin only)
  // ----------------------------------
  
  // Get all users (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsersByCity(req.session.city || "");
      
      // Remove passwords from response
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Update user (admin or self)
  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Only admins can update other users
    if (req.session.role !== "admin" && userId !== (req.session.userId || 0)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Admins can only update users in their own city
      if (req.session.role === "admin" && user.city !== (req.session.city || "")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Extract valid fields to update (prevent changing role, etc.)
      const { role, secretCode, isActive, rewardPoints, ...updateableFields } = req.body;
      
      // Additional admin-only fields
      if (req.session.role === "admin") {
        // Admins can update isActive status
        if (isActive !== undefined) {
          updateableFields.isActive = isActive;
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updateableFields);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Delete user (admin only)
  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Admins can only delete users in their own city
      if (user.city !== (req.session.city || "")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Admin cannot delete themselves
      if (userId === (req.session.userId || 0)) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}