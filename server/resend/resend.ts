import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Sender configuration
export const sender = {
  email: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  name: "Food Hub"
};

// Frontend URL for email links (use your Render static site URL)
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Backend URL for API calls
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
