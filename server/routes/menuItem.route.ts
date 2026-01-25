import express from "express";
import upload from "../middlewares/multer";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
    createMenuItem,
    getMenuByRestaurantId,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
} from "../controller/menuItem.controller";

const router = express.Router();

// Create menu item
router.route("/").post(
    isAuthenticated,
    upload.single("image"),
    createMenuItem
);

// Get menu by restaurant ID
router.route("/restaurant/:restaurantId").get(getMenuByRestaurantId);

// Update menu item
router.route("/:menuItemId").put(
    isAuthenticated,
    upload.single("image"),
    updateMenuItem
);

// Delete menu item
router.route("/:menuItemId").delete(isAuthenticated, deleteMenuItem);

// Toggle menu item availability
router
    .route("/:menuItemId/toggle-availability")
    .patch(isAuthenticated, toggleMenuItemAvailability);

export default router;
