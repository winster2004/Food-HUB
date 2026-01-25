// Load environment variables FIRST before any other imports
// On Render: .env file won't exist, so config will skip silently
// In development: .env file loads local config
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Only try to load .env if it exists (safe for production)
const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    // In production, env vars are provided by platform (Render)
    // In development, .env MUST exist
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ .env file not found. Using environment variables from process.');
    }
}

import express from "express";
import connectDB from "./db/connectDB";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.route";
import restaurantRoute from "./routes/restaurant.route";
import menuRoute from "./routes/menu.route";
import orderRoute from "./routes/order.route";
import paymentRoute from "./routes/payment.route";
import restaurantManagementRoute from "./routes/restaurantManagement.route";
import menuItemRoute from "./routes/menuItem.route";
import optionRoute from "./routes/option.route";
import { stripeWebhook } from "./controller/order.controller";

const app = express();

const PORT = process.env.PORT || 3000;

// Stripe webhook must receive raw body for signature verification
app.post("/api/v1/order/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// default middleware for any mern project
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());

// Validate CORS origin is configured in production
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
if (!clientUrl && process.env.NODE_ENV === 'production') {
    throw new Error('CLIENT_URL or FRONTEND_URL must be set in production environment');
}

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://food-hub-3-qxq3.onrender.com",
        clientUrl || "http://localhost:5173"
    ],
    credentials: true,
};
app.use(cors(corsOptions));

// Log environment configuration
console.log("🚀 Server Configuration:");
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 CORS Origin: ${corsOptions.origin}`);
console.log(`📧 Resend Email From: ${process.env.RESEND_FROM_EMAIL || '❌ NOT SET'}`);
console.log(`🔑 Resend API Key configured: ${process.env.RESEND_API_KEY ? '✅' : '❌'}`);
console.log(`🌍 Frontend URL (CLIENT_URL): ${process.env.CLIENT_URL || process.env.FRONTEND_URL || '❌ NOT SET'}`);
console.log(`🔐 Stripe Secret Key configured: ${process.env.STRIPE_SECRET_KEY ? '✅' : '❌'}`);
console.log(`📦 Database connected: Connecting...`);

// Health check
app.get("/", (_, res) => {
    res.send("Food Hub API is running 🚀");
});

// JSON health endpoint for probes
app.get("/healthz", (_, res) => {
    res.json({ status: "ok" });
});

// api
app.use("/api/v1/user", userRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/restaurant-management", restaurantManagementRoute);
app.use("/api/v1/menu-item", menuItemRoute);
app.use("/api/v1/option", optionRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/order", orderRoute);
// Mandatory endpoint: /api/payment/create-checkout-session
app.use("/api/payment", paymentRoute);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);
});