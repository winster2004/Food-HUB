import express from "express";
import upload from "../middlewares/multer";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    getRestaurant,
    updateRestaurant,
    deleteRestaurant,
    toggleRestaurantStatus,
} from "../controller/restaurantManagement.controller";

const router = express.Router();

// Create restaurant
router.route("/").post(
    isAuthenticated,
    upload.single("imageFile"),
    createRestaurant
);

// Get all active restaurants
router.route("/list/all").get(getAllRestaurants);

// Get current user's restaurant
router.route("/my/restaurant").get(isAuthenticated, getRestaurant);

// Get restaurant by ID
router.route("/:id").get(getRestaurantById);

// Update restaurant
router.route("/:id").put(
    isAuthenticated,
    upload.single("imageFile"),
    updateRestaurant
);

// Delete restaurant (soft delete)
router.route("/:id").delete(isAuthenticated, deleteRestaurant);

// Toggle restaurant status
router.route("/:id/toggle-status").patch(isAuthenticated, toggleRestaurantStatus);

export default router;
