import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import React, { FormEvent, useState, useEffect } from "react";
import { useMenuItemStore } from "@/store/useMenuItemStore";
import { useRestaurantManagementStore } from "@/store/useRestaurantManagementStore";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import OptionManagement from "./OptionManagement.tsx";

interface MenuItemForm {
    name: string;
    description: string;
    price: number;
    category: string;
    restaurantId: string;
    image?: File;
}

interface MenuItemFormError {
    name?: string;
    description?: string;
    price?: string;
    category?: string;
    restaurantId?: string;
    image?: string;
}

const MenuManagement = () => {
    const [input, setInput] = useState<MenuItemForm>({
        name: "",
        description: "",
        price: 0,
        category: "",
        restaurantId: "",
    });
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [error, setError] = useState<MenuItemFormError>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);
    const [showOptions, setShowOptions] = useState(false);

    const {
        loading: itemLoading,
        menuItems,
        createMenuItem,
        updateMenuItem,
        getMenuByRestaurantId,
        deleteMenuItem,
        toggleMenuItemAvailability,
    } = useMenuItemStore();

    const { restaurants, getCurrentUserRestaurant } = useRestaurantManagementStore();

    // Load restaurants on mount
    useEffect(() => {
        getCurrentUserRestaurant();
    }, [getCurrentUserRestaurant]);

    // Auto-select first restaurant when restaurants load
    useEffect(() => {
        if (restaurants.length > 0 && !input.restaurantId) {
            const firstRestaurant = restaurants[0];
            setInput(prev => ({ ...prev, restaurantId: firstRestaurant._id }));
        }
    }, [restaurants]);

    // Fetch menus when restaurant is selected
    useEffect(() => {
        if (input.restaurantId) {
            getMenuByRestaurantId(input.restaurantId);
        }
    }, [input.restaurantId]);

    const changeEventHandler = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setInput({
            ...input,
            [name]: type === "number" ? Number(value) : value,
        });
    };

    const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (file) {
            setInput({ ...input, image: file });
        }
    };

    const resetForm = () => {
        setInput({
            name: "",
            description: "",
            price: 0,
            category: "",
            restaurantId: input.restaurantId,
        });
        setIsEditing(false);
        setEditingId(null);
        setError({});
    };

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.name || !input.category || !input.restaurantId) {
            setError({
                name: input.name ? "" : "Name is required",
                category: input.category ? "" : "Category is required",
                restaurantId: input.restaurantId
                    ? ""
                    : "Restaurant is required",
            });
            return;
        }

        if (!isEditing && !input.image) {
            setError({ ...error, image: "Image is required" });
            return;
        }

        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("price", input.price.toString());
        formData.append("category", input.category);
        formData.append("restaurantId", input.restaurantId);

        if (input.image) {
            formData.append("image", input.image);
        }

        try {
            if (isEditing && editingId) {
                await updateMenuItem(editingId, formData);
            } else {
                await createMenuItem(formData);
            }
            setOpen(false);
            resetForm();
            // Refetch menu items after creation/update
            if (input.restaurantId) {
                await getMenuByRestaurantId(input.restaurantId);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleEdit = (item: any) => {
        setInput({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            restaurantId: item.restaurantId,
        });
        setEditingId(item._id);
        setIsEditing(true);
        setOpen(true);
    };

    const handleDelete = (menuItemId: string) => {
        setDeleteId(menuItemId);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteMenuItem(deleteId);
            setDeleteOpen(false);
            setDeleteId(null);
        }
    };

    const handleManageOptions = (menuItem: any) => {
        setSelectedMenuItem(menuItem);
        setShowOptions(true);
    };

    if (showOptions && selectedMenuItem) {
        return (
            <OptionManagement
                menuItem={selectedMenuItem}
                onBack={() => {
                    setShowOptions(false);
                    setSelectedMenuItem(null);
                }}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto my-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-bold md:font-extrabold text-lg md:text-2xl">
                    Menu Management
                </h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-orange hover:bg-hoverOrange"
                            onClick={resetForm}
                            disabled={!input.restaurantId && !isEditing}
                        >
                            <Plus className="mr-2" />
                            Add Menu Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-screen overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing
                                    ? "Edit Menu Item"
                                    : "Add a New Menu Item"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Update menu item details"
                                    : "Create a new menu item for the selected restaurant."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitHandler}>
                            <div className="space-y-4">
                                {/* Restaurant Selection */}
                                <div>
                                    <Label>Select Restaurant</Label>
                                    <Select
                                        value={input.restaurantId}
                                        onValueChange={(value) =>
                                            setInput({
                                                ...input,
                                                restaurantId: value,
                                            })
                                        }
                                        disabled={isEditing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a restaurant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {restaurants.map((restaurant) => (
                                                <SelectItem
                                                    key={restaurant._id}
                                                    value={restaurant._id}
                                                >
                                                    {restaurant.restaurantName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {error.restaurantId && (
                                        <span className="text-red-500 text-sm">
                                            {error.restaurantId}
                                        </span>
                                    )}
                                </div>

                                {/* Item Name */}
                                <div>
                                    <Label>Item Name</Label>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={input.name}
                                        onChange={changeEventHandler}
                                        placeholder="e.g., Margherita Pizza"
                                    />
                                    {error.name && (
                                        <span className="text-red-500 text-sm">
                                            {error.name}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <Label>Description</Label>
                                    <textarea
                                        name="description"
                                        value={input.description}
                                        onChange={changeEventHandler}
                                        placeholder="Describe this menu item..."
                                        className="w-full border rounded p-2 h-20"
                                    />
                                </div>

                                {/* Price & Category */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Price</Label>
                                        <Input
                                            type="number"
                                            name="price"
                                            value={input.price}
                                            onChange={changeEventHandler}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <Input
                                            type="text"
                                            name="category"
                                            value={input.category}
                                            onChange={changeEventHandler}
                                            placeholder="e.g., Pizza, Appetizer"
                                        />
                                        {error.category && (
                                            <span className="text-red-500 text-sm">
                                                {error.category}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Image */}
                                <div>
                                    <Label>Menu Item Image</Label>
                                    <Input
                                        type="file"
                                        name="image"
                                        onChange={fileChangeHandler}
                                        accept="image/*"
                                    />
                                    {!isEditing && error.image && (
                                        <span className="text-red-500 text-sm">
                                            {error.image}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={itemLoading}
                                    className="bg-orange hover:bg-hoverOrange"
                                >
                                    {itemLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? "Updating..." : "Creating..."}
                                        </>
                                    ) : isEditing ? (
                                        "Update Item"
                                    ) : (
                                        "Create Item"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Restaurant Filter */}
            {restaurants.length > 0 && (
                <div className="mb-6">
                    <Label className="block mb-2">Filter by Restaurant</Label>
                    <Select
                        value={input.restaurantId}
                        onValueChange={(value) => {
                            setInput({ ...input, restaurantId: value });
                            resetForm();
                        }}
                    >
                        <SelectTrigger className="w-full md:w-64">
                            <SelectValue placeholder="Select restaurant" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Restaurants</SelectItem>
                            {restaurants.map((restaurant) => (
                                <SelectItem key={restaurant._id} value={restaurant._id}>
                                    {restaurant.restaurantName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Menu Items List */}
            {itemLoading && !menuItems.length ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin h-8 w-8" />
                </div>
            ) : menuItems.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>
                        {input.restaurantId
                            ? "No menu items yet. Create one to get started!"
                            : "Select a restaurant to manage its menu."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <div
                            key={item._id}
                            className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                        >
                            {/* Image */}
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-40 object-cover"
                            />

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg truncate">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {item.description}
                                </p>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p className="font-semibold text-orange">
                                        ${item.price.toFixed(2)}
                                    </p>
                                    <p className="text-xs">
                                        Category: {item.category}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className="mt-3 flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                            item.isAvailable
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {item.isAvailable ? "Available" : "Unavailable"}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            toggleMenuItemAvailability(item._id)
                                        }
                                        disabled={itemLoading}
                                    >
                                        {item.isAvailable ? (
                                            <ToggleRight className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ToggleLeft className="h-4 w-4 text-gray-600" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleManageOptions(item)
                                        }
                                    >
                                        Options
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will delete the menu item and all associated
                            options. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {itemLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MenuManagement;
