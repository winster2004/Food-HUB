import mongoose, { Document } from "mongoose";

export interface IRestaurant {
    restaurantName: string;
    description: string;
    address: string;
    city: string;
    country: string;
    deliveryTime: number;
    cuisines: string[];
    imageUrl: string;
    isActive: boolean;
    user: mongoose.Schema.Types.ObjectId;
    menus: mongoose.Schema.Types.ObjectId[];
}

export interface IRestaurantDocument extends IRestaurant, Document {
    createdAt: Date;
    updatedAt: Date;
}

const restaurantSchema = new mongoose.Schema<IRestaurantDocument>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        restaurantName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        deliveryTime: {
            type: Number,
            required: true,
            default: 30,
        },
        cuisines: [{ type: String, required: true }],
        imageUrl: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        menus: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
    },
    { timestamps: true }
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
