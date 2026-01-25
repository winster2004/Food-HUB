import express from "express"
import {isAuthenticated} from "../middlewares/isAuthenticated";
import { createCheckoutSession, getOrders, getOrderById } from "../controller/order.controller";
const router = express.Router();

router.route("/").get(isAuthenticated, getOrders);
router.route("/:orderId").get(isAuthenticated, getOrderById);
router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
// Alias to satisfy mandatory endpoint path semantics: /api/payment/create-checkout-session
router.route("/payment/create-checkout-session").post(isAuthenticated, createCheckoutSession);

export default router;