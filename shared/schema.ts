import { pgTable, text, serial, integer, boolean, date, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  dob: date("dob"),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  role: text("role").notNull().default("user"), // "user" or "admin"
  secretCode: text("secret_code"),
  isActive: boolean("is_active").notNull().default(true),
  rewardPoints: integer("reward_points").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  rewardPoints: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]),
});

// Admin Secret Code schema
export const adminSecretCodes = pgTable("admin_secret_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  city: text("city").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
});

export const insertAdminSecretCodeSchema = createInsertSchema(adminSecretCodes).omit({
  id: true,
  isUsed: true,
});

// Waste Report schema
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  address: text("address").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "rejected"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  adminNotes: text("admin_notes"),
  assignedAdminId: integer("assigned_admin_id"),
  rewardPoints: integer("reward_points"),
  completedAt: timestamp("completed_at"),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
  assignedAdminId: true,
  rewardPoints: true,
  completedAt: true,
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "rejected"]),
  adminNotes: z.string().optional(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Login = z.infer<typeof loginSchema>;

export type AdminSecretCode = typeof adminSecretCodes.$inferSelect;
export type InsertAdminSecretCode = z.infer<typeof insertAdminSecretCodeSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type UpdateReportStatus = z.infer<typeof updateReportStatusSchema>;