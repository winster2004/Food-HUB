import { Request, Response } from "express";
import { Option } from "../models/option.model";
import { MenuItem } from "../models/menuItem.model";
import { Restaurant } from "../models/restaurant.model";
import mongoose from "mongoose";

// Create option for a menu item
export const createOption = async (req: Request, res: Response) => {
    try {
        const { menuItemId, name, price, isRequired } = req.body;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID",
            });
        }

        // Validate menu item exists
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
                message: "Not authorized to add options to this item",
            });
        }

        const option = await Option.create({
            menuItemId,
            name,
            price: price || 0,
            isRequired: isRequired || false,
        });

        // Add option to menu item
        await MenuItem.findByIdAndUpdate(
            menuItemId,
            { $push: { options: option._id } },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: "Option created successfully",
            option,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get options by menu item ID
export const getOptionsByMenuItemId = async (req: Request, res: Response) => {
    try {
        const { menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID",
            });
        }

        // Verify menu item exists
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        const options = await Option.find({ menuItemId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: options.length,
            options,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update option
export const updateOption = async (req: Request, res: Response) => {
    try {
        const { optionId } = req.params;
        const { name, price, isRequired } = req.body;

        if (!mongoose.Types.ObjectId.isValid(optionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid option ID",
            });
        }

        const option = await Option.findById(optionId);
        if (!option) {
            return res.status(404).json({
                success: false,
                message: "Option not found",
            });
        }

        // Verify authorization through restaurant
        const menuItem = await MenuItem.findById(option.menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant?.user.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this option",
            });
        }

        if (name) option.name = name;
        if (price !== undefined) option.price = price;
        if (isRequired !== undefined) option.isRequired = isRequired;

        await option.save();

        return res.status(200).json({
            success: true,
            message: "Option updated successfully",
            option,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete option
export const deleteOption = async (req: Request, res: Response) => {
    try {
        const { optionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(optionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid option ID",
            });
        }

        const option = await Option.findById(optionId);
        if (!option) {
            return res.status(404).json({
                success: false,
                message: "Option not found",
            });
        }

        // Verify authorization
        const menuItem = await MenuItem.findById(option.menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant?.user.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this option",
            });
        }

        // Remove from menu item
        await MenuItem.findByIdAndUpdate(
            option.menuItemId,
            { $pull: { options: option._id } },
            { new: true }
        );

        // Delete option
        await Option.findByIdAndDelete(optionId);

        return res.status(200).json({
            success: true,
            message: "Option deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Toggle option requirement status
export const toggleOptionRequired = async (req: Request, res: Response) => {
    try {
        const { optionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(optionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid option ID",
            });
        }

        const option = await Option.findById(optionId);
        if (!option) {
            return res.status(404).json({
                success: false,
                message: "Option not found",
            });
        }

        // Verify authorization
        const menuItem = await MenuItem.findById(option.menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        const restaurant = await Restaurant.findById(menuItem.restaurantId);
        if (restaurant?.user.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this option",
            });
        }

        option.isRequired = !option.isRequired;
        await option.save();

        return res.status(200).json({
            success: true,
            message: `Option marked as ${option.isRequired ? "required" : "optional"}`,
            option,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
