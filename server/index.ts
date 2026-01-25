// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

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

const DIRNAME = path.resolve();

// Stripe webhook must receive raw body for signature verification
app.post("/api/v1/order/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// default middleware for any mern project
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));

// Log environment configuration
console.log("🚀 Server Configuration:");
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 CORS Origin: ${corsOptions.origin}`);
console.log(`📧 Resend Email From: ${process.env.RESEND_FROM_EMAIL}`);
console.log(`🔑 Resend API Key configured: ${process.env.RESEND_API_KEY ? '✅' : '❌'}`);

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

app.use(express.static(path.join(DIRNAME,"/client/dist")));
app.use("*",(_,res) => {
    res.sendFile(path.resolve(DIRNAME, "client","dist","index.html"));
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);
});