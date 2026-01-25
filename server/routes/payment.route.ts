import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { createCheckoutSession, verifyAndCreateOrder } from "../controller/order.controller";

const router = express.Router();

// Mandatory endpoint alias: POST /api/payment/create-checkout-session
router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);

// New endpoint to verify payment and create order on success page
router.post("/verify-order", isAuthenticated, verifyAndCreateOrder);

export default router;