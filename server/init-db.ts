import { db } from "./db";
import { users, adminSecretCodes, reports } from "@shared/schema";
import { initializeAdminSecretCodes } from "./database-storage";

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Create tables if they don't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT NOT NULL,
        dob DATE NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        secret_code TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        reward_points INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS admin_secret_codes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL,
        is_used BOOLEAN NOT NULL DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        admin_notes TEXT,
        assigned_admin_id INTEGER REFERENCES users(id),
        reward_points INTEGER,
        completed_at TIMESTAMP
      );
    `);

    console.log("Database tables created successfully");

    // Initialize admin secret codes
    await initializeAdminSecretCodes();

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 