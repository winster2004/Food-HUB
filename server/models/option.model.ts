import mongoose, { Document } from "mongoose";

export interface IOption {
    name: string;
    price: number;
    isRequired: boolean;
    menuItemId: mongoose.Schema.Types.ObjectId;
}

export interface IOptionDocument extends IOption, Document {
    createdAt: Date;
    updatedAt: Date;
}

const optionSchema = new mongoose.Schema<IOptionDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        isRequired: {
            type: Boolean,
            default: false,
        },
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true,
        },
    },
    { timestamps: true }
);

export const Option = mongoose.model("Option", optionSchema);
