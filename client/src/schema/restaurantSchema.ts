import {z} from "zod";

export const restaurantFromSchema = z.object({
    restaurantName:z.string().nonempty({message:"Restaurant name is required"}),
    description:z.string().optional(),
    address:z.string().nonempty({message:"Address is required"}),
    city:z.string().nonempty({message:"City is required"}),
    country:z.string().nonempty({message:"Country is required"}),
    deliveryTime:z.number().min(0, {message:"Delivery time can not be negative"}),
    cuisines:z.array(z.string()),
    imageFile:z.union([z.instanceof(File), z.string()]).optional(),
});

export type RestaurantFormSchema = z.infer<typeof restaurantFromSchema>;
