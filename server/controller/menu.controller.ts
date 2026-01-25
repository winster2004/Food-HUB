import { Request, Response } from "express";
import uploadImageOnCloudinary from "../utils/imageUpload";
import {Menu} from "../models/menu.model";
import { Restaurant } from "../models/restaurant.model";
import mongoose, { ObjectId } from "mongoose";

export const addMenu = async (req:Request, res:Response) => {
    try {
        console.log("[CREATE MENU] Request body:", req.body);
        const {name, description, price} = req.body;
        const file = req.file;
        if(!file){
            return res.status(400).json({
                success:false,
                message:"Image is required"
            })
        };
        const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
        console.log("[CREATE MENU] Image uploaded:", imageUrl);
        
        const menu: any = await Menu.create({
            name , 
            description,
            price,
            image:imageUrl
        });
        console.log("[CREATE MENU] Menu created:", menu._id);
        
        const restaurant = await Restaurant.findOne({user:req.id});
        if(restaurant){
            (restaurant.menus as mongoose.Schema.Types.ObjectId[]).push(menu._id);
            await restaurant.save();
            console.log("[CREATE MENU] Menu added to restaurant:", restaurant._id);
        }

        return res.status(201).json({
            success:true,
            message:"Menu added successfully",
            menu
        });
    } catch (error) {
        console.error("[CREATE MENU ERROR]", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        }); 
    }
}
export const editMenu = async (req:Request, res:Response) => {
    try {
        const {id} = req.params;
        const {name, description, price} = req.body;
        const file = req.file;
        const menu = await Menu.findById(id);
        if(!menu){
            return res.status(404).json({
                success:false,
                message:"Menu not found!"
            })
        }
        if(name) menu.name = name;
        if(description) menu.description = description;
        if(price) menu.price = price;

        if(file){
            const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
            menu.image = imageUrl;
        }
        await menu.save();

        return res.status(200).json({
            success:true,
            message:"Menu updated",
            menu,
        })
    } catch (error) {
        console.error("[EDIT MENU ERROR]", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        }); 
    }
}

export const getMenus = async (req:Request, res:Response) => {
    try {
        const menus = await Menu.find({});
        console.log("[GET MENUS] Found menus:", menus.length);
        
        return res.status(200).json({
            success:true,
            menus
        });
    } catch (error) {
        console.error("[GET MENUS ERROR]", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        }); 
    }
}

export const deleteMenu = async (req:Request, res:Response) => {
    try {
        const {id} = req.params;
        console.log("[DELETE MENU] Attempting to delete menu:", id);
        
        const menu = await Menu.findById(id);
        if(!menu){
            return res.status(404).json({
                success:false,
                message:"Menu not found!"
            })
        }

        // Remove menu from all restaurants
        await Restaurant.updateMany(
            { menus: id },
            { $pull: { menus: id } }
        );
        console.log("[DELETE MENU] Removed menu from restaurants");

        // Delete the menu
        await Menu.findByIdAndDelete(id);
        console.log("[DELETE MENU] Menu deleted successfully:", id);

        return res.status(200).json({
            success:true,
            message:"Menu deleted successfully"
        })
    } catch (error) {
        console.error("[DELETE MENU ERROR]", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        }); 
    }
}