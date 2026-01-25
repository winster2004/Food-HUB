import mongoose, { Document } from "mongoose";

export interface IMenuItem {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isAvailable: boolean;
    restaurantId: mongoose.Schema.Types.ObjectId;
    options: mongoose.Schema.Types.ObjectId[];
}

export interface IMenuItemDocument extends IMenuItem, Document {
    createdAt: Date;
    updatedAt: Date;
}

const menuItemSchema = new mongoose.Schema<IMenuItemDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        options: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Option" }
        ],
    },
    { timestamps: true }
);

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);
