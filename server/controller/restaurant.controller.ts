import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import { Multer } from "multer";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { Order } from "../models/order.model";
import { MenuItem } from "../models/menuItem.model";
import { Menu } from "../models/menu.model";

// Helper function to safely parse cuisines
const parseCuisines = (cuisinesData: any): string[] => {
    try {
        // If it's already an array, return it
        if (Array.isArray(cuisinesData)) {
            return cuisinesData.map(c => {
                // Clean up any JSON-encoded strings
                if (typeof c === 'string') {
                    try {
                        return JSON.parse(c);
                    } catch {
                        return c;
                    }
                }
                return c;
            });
        }
        // If it's a string, try to parse it
        if (typeof cuisinesData === 'string') {
            const parsed = JSON.parse(cuisinesData);
            // If parsed result is also a string (double-encoded), parse again
            if (typeof parsed === 'string') {
                return JSON.parse(parsed);
            }
            return Array.isArray(parsed) ? parsed : [parsed];
        }
        return [];
    } catch (error) {
        console.error('Error parsing cuisines:', error);
        // Fallback: if it's a string, just return it as single element array
        return typeof cuisinesData === 'string' ? [cuisinesData] : [];
    }
};

export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;
 

        const restaurant = await Restaurant.findOne({ user: req.id, isActive: true });
        if (restaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant already exist for this user"
            })
        }
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            })
        }
        const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
        await Restaurant.create({
            user: req.id,
            restaurantName,
            city,
            country,
            deliveryTime,
            cuisines: parseCuisines(cuisines),
            imageUrl
        });
        return res.status(201).json({
            success: true,
            message: "Restaurant Added"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.id, isActive: true }).populate('menus');
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                restaurant:[],
                message: "Restaurant not found"
            })
        };
        return res.status(200).json({ success: true, restaurant });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const updateRestaurant = async (req: Request, res: Response) => {
    try {
        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;
        const restaurant = await Restaurant.findOne({ user: req.id, isActive: true });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            })
        };
        restaurant.restaurantName = restaurantName;
        restaurant.city = city;
        restaurant.country = country;
        restaurant.deliveryTime = deliveryTime;
        restaurant.cuisines = parseCuisines(cuisines);

        if (file) {
            const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
            restaurant.imageUrl = imageUrl;
        }
        await restaurant.save();
        return res.status(200).json({
            success: true,
            message: "Restaurant updated",
            restaurant
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getRestaurantOrder = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.id, isActive: true });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            })
        };
        const orders = await Order.find({ restaurant: restaurant._id }).populate('restaurant').populate('user');
        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }
        order.status = status;
        await order.save();
        return res.status(200).json({
            success: true,
            status:order.status,
            message: "Status updated"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const searchText = req.params.searchText || "";
        const searchQuery = req.query.searchQuery as string || "";
        const selectedCuisines = (req.query.selectedCuisines as string || "").split(",").filter(cuisine => cuisine);
        const query: any = {};
        
        console.log("[SEARCH RESTAURANT]", { searchText, searchQuery, selectedCuisines });
        
        // Build search conditions array
        const conditions: any[] = [];
        
        // Search by location (searchText)
        if (searchText) {
            conditions.push({
                $or: [
                    { restaurantName: { $regex: searchText, $options: 'i' } },
                    { city: { $regex: searchText, $options: 'i' } },
                    { country: { $regex: searchText, $options: 'i' } },
                ]
            });
        }
        
        // Search by query (name or cuisine) - only if different from searchText
        if (searchQuery && searchQuery !== searchText) {
            conditions.push({
                $or: [
                    { restaurantName: { $regex: searchQuery, $options: 'i' } },
                    { cuisines: { $regex: searchQuery, $options: 'i' } }
                ]
            });
        }
        
        // Filter by selected cuisines
        if (selectedCuisines.length > 0) {
            const cuisineConditions = selectedCuisines.map(c => ({
                cuisines: { $regex: c, $options: 'i' }
            }));
            conditions.push({
                $or: cuisineConditions
            });
        }
        
        // Combine all conditions with AND
        if (conditions.length > 0) {
            if (conditions.length === 1) {
                Object.assign(query, conditions[0]);
            } else {
                query.$and = conditions;
            }
        }
        
        console.log("[SEARCH QUERY]", JSON.stringify(query));
        
        const restaurants = await Restaurant.find(query);
        console.log("[SEARCH RESULTS]", restaurants.length);
        
        return res.status(200).json({
            success:true,
            data:restaurants
        });
    } catch (error) {
        console.log("[SEARCH ERROR]", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getSingleRestaurant = async (req:Request, res:Response) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId).populate({
            path:'menus',
            options:{createdAt:-1}
        });
        if(!restaurant){
            return res.status(404).json({
                success:false,
                message:"Restaurant not found"
            })
        };
        
        // Fetch menu items (restaurant-specific items) for this restaurant
        const menuItems = await MenuItem.find({ 
            restaurantId: restaurantId,
            isAvailable: true 
        }).populate('options').sort({ createdAt: -1 });
        
        console.log(`[GET SINGLE RESTAURANT] Restaurant: ${restaurantId}, Legacy Menus: ${restaurant.menus?.length || 0}, Menu Items: ${menuItems.length}`);
        
        // Combine both legacy menus and new menu items
        // Priority: Show menuItems first, then legacy menus
        let allMenus: any[] = [
            ...menuItems,
            ...(restaurant.menus || []).filter((menu: any) => 
                !menuItems.find((item: any) => item._id.toString() === menu._id.toString())
            )
        ];
        
        console.log(`[GET SINGLE RESTAURANT] Restaurant: ${restaurantId}, Legacy Menus: ${restaurant.menus?.length || 0}, Menu Items: ${menuItems.length}, Total: ${allMenus.length}`);
        
        const restaurantWithItems = {
            ...restaurant.toObject(),
            menus: allMenus
        };
        
        return res.status(200).json({success:true, restaurant: restaurantWithItems});
    } catch (error) {
        console.error("[GET SINGLE RESTAURANT ERROR]", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        })
    }
}