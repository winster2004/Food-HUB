import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import uploadImageOnCloudinary from "../utils/imageUpload";
import mongoose from "mongoose";

declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

// Helper function to safely parse cuisines
const parseCuisines = (cuisinesData: any): string[] => {
    try {
        if (Array.isArray(cuisinesData)) {
            return cuisinesData.map((c) => {
                if (typeof c === "string") {
                    try {
                        return JSON.parse(c);
                    } catch {
                        return c;
                    }
                }
                return c;
            });
        }
        if (typeof cuisinesData === "string") {
            const parsed = JSON.parse(cuisinesData);
            if (typeof parsed === "string") {
                return JSON.parse(parsed);
            }
            return Array.isArray(parsed) ? parsed : [parsed];
        }
        return [];
    } catch (error) {
        console.error("Error parsing cuisines:", error);
        return typeof cuisinesData === "string" ? [cuisinesData] : [];
    }
};

// Create a new restaurant
export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const {
            restaurantName,
            description,
            address,
            city,
            country,
            deliveryTime,
            cuisines,
        } = req.body;
        const file = req.file;

        // Check if user already has a restaurant (active or inactive)
        const existingRestaurant = await Restaurant.findOne({ user: req.id });
        if (existingRestaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant already exists for this user. Please edit your existing restaurant instead.",
            });
        }

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Image is required",
            });
        }

        const imageUrl = await uploadImageOnCloudinary(
            file as Express.Multer.File
        );

        const restaurant = await Restaurant.create({
            user: req.id,
            restaurantName,
            description,
            address,
            city,
            country,
            deliveryTime,
            cuisines: parseCuisines(cuisines),
            imageUrl,
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            restaurant,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all restaurants (for admin)
export const getAllRestaurants = async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find({ isActive: true })
            .populate("menus")
            .select("-user")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: restaurants.length,
            restaurants,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get restaurant by ID
export const getRestaurantById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID",
            });
        }

        const restaurant = await Restaurant.findById(id)
            .populate({
                path: "menus",
                populate: { path: "options" },
            })
            .populate("user", "fullname email");

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        return res.status(200).json({ success: true, restaurant });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get restaurant for current user
export const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find({ user: req.id }).populate({
            path: "menus",
            populate: { path: "options" },
        }).sort({ createdAt: -1 });

        if (!restaurants || restaurants.length === 0) {
            return res.status(404).json({
                success: false,
                restaurants: [],
                message: "No restaurants found",
            });
        }

        return res.status(200).json({ success: true, restaurants });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update restaurant
export const updateRestaurant = async (req: Request, res: Response) => {
    try {
        const {
            restaurantName,
            description,
            address,
            city,
            country,
            deliveryTime,
            cuisines,
            isActive,
        } = req.body;
        const file = req.file;

        const restaurant = await Restaurant.findOne({ user: req.id, isActive: true });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        if (restaurantName) restaurant.restaurantName = restaurantName;
        if (description !== undefined) restaurant.description = description;
        if (address) restaurant.address = address;
        if (city) restaurant.city = city;
        if (country) restaurant.country = country;
        if (deliveryTime) restaurant.deliveryTime = deliveryTime;
        if (cuisines) restaurant.cuisines = parseCuisines(cuisines);
        if (isActive !== undefined) restaurant.isActive = isActive;

        if (file) {
            const imageUrl = await uploadImageOnCloudinary(
                file as Express.Multer.File
            );
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save();

        return res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            restaurant,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Soft delete restaurant
export const deleteRestaurant = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID",
            });
        }

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        // Soft delete
        restaurant.isActive = false;
        await restaurant.save();

        return res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Toggle restaurant active status
export const toggleRestaurantStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID",
            });
        }

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        restaurant.isActive = !restaurant.isActive;
        await restaurant.save();

        return res.status(200).json({
            success: true,
            message: `Restaurant ${restaurant.isActive ? "activated" : "deactivated"}`,
            restaurant,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
