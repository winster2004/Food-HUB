import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Only load .env if it exists (safe for production deployment)
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Sender configuration
export const sender = {
  email: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  name: "Food Hub"
};

// Frontend URL for email links - Prefer CLIENT_URL, fallback to FRONTEND_URL
// In production, at least one of these MUST be set
const getFrontendUrl = () => {
  const url = process.env.CLIENT_URL || process.env.FRONTEND_URL;
  if (!url && process.env.NODE_ENV === 'production') {
    throw new Error('CLIENT_URL or FRONTEND_URL must be set in production for email verification links');
  }
  return url || "http://localhost:5173";
};

export const FRONTEND_URL = getFrontendUrl();

// Backend URL for API calls - In production, this should be the backend service URL
const getBackendUrl = () => {
  const url = process.env.BACKEND_URL;
  if (!url && process.env.NODE_ENV === 'production') {
    throw new Error('BACKEND_URL must be set in production for email action links');
  }
  return url || "http://localhost:3000";
};

export const BACKEND_URL = getBackendUrl();
