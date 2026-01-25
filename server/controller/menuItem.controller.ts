import { Request, Response } from "express";
import { MenuItem } from "../models/menuItem.model";
import { Restaurant } from "../models/restaurant.model";
import { Option } from "../models/option.model";
import uploadImageOnCloudinary from "../utils/imageUpload";
import mongoose from "mongoose";

// Create menu item for a restaurant
export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            price,
            category,
            restaurantId,
        } = req.body;
        const file = req.file;

        // Validate restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        // Only restaurant owner can add menu items
        if (restaurant.user.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to add items to this restaurant",
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

        const menuItem = await MenuItem.create({
            name,
            description,
            price,
            category,
            image: imageUrl,
            restaurantId,
            isAvailable: true,
        });

        // Add menu item to restaurant
        await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $push: { menus: menuItem._id } },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            menuItem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get menu items by restaurant ID
export const getMenuByRestaurantId = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID",
            });
        }

        const menuItems = await MenuItem.find({
            restaurantId,
            // Note: You can add isAvailable: true filter if you only want available items
        })
            .populate("options")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: menuItems.length,
            menuItems,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { menuItemId } = req.params;
        const {
            name,
            description,
            price,
            category,
            isAvailable,
        } = req.body;
        const file = req.file;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID",
            });
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        // Verify authorization
        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant?.user.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this item",
            });
        }

        if (name) menuItem.name = name;
        if (description) menuItem.description = description;
        if (price) menuItem.price = price;
        if (category) menuItem.category = category;
        if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

        if (file) {
            const imageUrl = await uploadImageOnCloudinary(
                file as Express.Multer.File
            );
            menuItem.image = imageUrl;
        }

        await menuItem.save();

        return res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            menuItem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete menu item (hard delete - includes associated options)
export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID",
            });
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        // Verify authorization
        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant?.user.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this item",
            });
        }

        // Delete all associated options
        await Option.deleteMany({ menuItemId });

        // Remove from restaurant
        await Restaurant.findByIdAndUpdate(
            menuItem.restaurantId,
            { $pull: { menus: menuItem._id } },
            { new: true }
        );

        // Delete menu item
        await MenuItem.findByIdAndDelete(menuItemId);

        return res.status(200).json({
            success: true,
            message: "Menu item and associated options deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Toggle menu item availability
export const toggleMenuItemAvailability = async (req: Request, res: Response) => {
    try {
        const { menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID",
            });
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        // Verify authorization
        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant?.user.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this item",
            });
        }

        menuItem.isAvailable = !menuItem.isAvailable;
        await menuItem.save();

        return res.status(200).json({
            success: true,
            message: `Menu item ${menuItem.isAvailable ? "enabled" : "disabled"}`,
            menuItem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
