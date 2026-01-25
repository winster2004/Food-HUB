import {z} from "zod";

export const menuSchema = z.object({
    name:z.string().nonempty({message:"Name is required"}),
    description:z.string().nonempty({message:"description is required"}),
    price:z.number().min(0,{message:"Price can not be negative"}),
    image:z.union([z.instanceof(File), z.string()]).optional(),
});
export type MenuFormSchema = z.infer<typeof menuSchema>;