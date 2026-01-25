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
import { Loader2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Menu } from "lucide-react";
import React, { FormEvent, useState, useEffect } from "react";
import { useRestaurantManagementStore } from "@/store/useRestaurantManagementStore";
import { useNavigate } from "react-router-dom";
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

interface RestaurantForm {
    restaurantName: string;
    description: string;
    address: string;
    city: string;
    country: string;
    deliveryTime: number;
    cuisines: string;
    imageFile?: File;
}

interface RestaurantFormError {
    restaurantName?: string;
    description?: string;
    address?: string;
    city?: string;
    country?: string;
    deliveryTime?: string;
    cuisines?: string;
    imageFile?: string;
}

const RestaurantManagement = () => {
    const [input, setInput] = useState<RestaurantForm>({
        restaurantName: "",
        description: "",
        address: "",
        city: "",
        country: "",
        deliveryTime: 30,
        cuisines: "",
    });
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [error, setError] = useState<RestaurantFormError>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const navigate = useNavigate();

    const { loading, restaurants, createRestaurant, updateRestaurant, getAllRestaurants, deleteRestaurant, toggleRestaurantStatus } =
        useRestaurantManagementStore();

    useEffect(() => {
        // Show persisted data immediately on mount
        const hasPersistedData = restaurants && restaurants.length > 0;
        
        // Always attempt to refresh data from API in the background
        const refreshData = async () => {
            await getAllRestaurants();
        };
        
        refreshData();
        
        // If no data is loaded yet, try fetching even more aggressively
        if (!hasPersistedData) {
            // Retry after a short delay in case of slow connection
            const retryTimer = setTimeout(() => {
                refreshData();
            }, 1500);
            return () => clearTimeout(retryTimer);
        }
    }, []);

    const changeEventHandler = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setInput({
            ...input,
            [name]:
                type === "number" ? Number(value) : value,
        });
    };

    const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (file) {
            setInput({ ...input, imageFile: file });
        }
    };

    const resetForm = () => {
        setInput({
            restaurantName: "",
            description: "",
            address: "",
            city: "",
            country: "",
            deliveryTime: 30,
            cuisines: "",
        });
        setIsEditing(false);
        setEditingId(null);
        setError({});
    };

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.restaurantName || !input.address || !input.city || !input.country) {
            setError({
                restaurantName: input.restaurantName ? "" : "Name is required",
                address: input.address ? "" : "Address is required",
                city: input.city ? "" : "City is required",
                country: input.country ? "" : "Country is required",
            });
            return;
        }

        if (!isEditing && !input.imageFile) {
            setError({ ...error, imageFile: "Image is required" });
            return;
        }

        const formData = new FormData();
        formData.append("restaurantName", input.restaurantName);
        formData.append("description", input.description);
        formData.append("address", input.address);
        formData.append("city", input.city);
        formData.append("country", input.country);
        formData.append("deliveryTime", input.deliveryTime.toString());
        formData.append(
            "cuisines",
            JSON.stringify(
                input.cuisines.split(",").map((c) => c.trim()).filter(Boolean)
            )
        );

        if (input.imageFile) {
            formData.append("imageFile", input.imageFile);
        }

        try {
            if (isEditing && editingId) {
                await updateRestaurant(editingId, formData);
            } else {
                await createRestaurant(formData);
            }
            setOpen(false);
            resetForm();
        } catch (error) {
            console.log(error);
        }
    };

    const handleEdit = (restaurant: any) => {
        setInput({
            restaurantName: restaurant.restaurantName,
            description: restaurant.description,
            address: restaurant.address,
            city: restaurant.city,
            country: restaurant.country,
            deliveryTime: restaurant.deliveryTime,
            cuisines: restaurant.cuisines.join(", "),
        });
        setEditingId(restaurant._id);
        setIsEditing(true);
        setOpen(true);
    };

    const handleDelete = (restaurantId: string) => {
        setDeleteId(restaurantId);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteRestaurant(deleteId);
            setDeleteOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto my-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-bold md:font-extrabold text-lg md:text-2xl">
                    Restaurant Management
                </h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-orange hover:bg-hoverOrange"
                            onClick={resetForm}
                        >
                            <Plus className="mr-2" />
                            Add Restaurant
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-screen overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing
                                    ? "Edit Restaurant"
                                    : "Add a New Restaurant"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Update restaurant details"
                                    : "Create a new restaurant that will manage menus and items."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitHandler}>
                            <div className="space-y-4">
                                {/* Restaurant Name */}
                                <div>
                                    <Label>Restaurant Name</Label>
                                    <Input
                                        type="text"
                                        name="restaurantName"
                                        value={input.restaurantName}
                                        onChange={changeEventHandler}
                                        placeholder="e.g., Pizza Palace"
                                    />
                                    {error.restaurantName && (
                                        <span className="text-red-500 text-sm">
                                            {error.restaurantName}
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
                                        placeholder="Describe your restaurant..."
                                        className="w-full border rounded p-2 h-20"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <Label>Address</Label>
                                    <Input
                                        type="text"
                                        name="address"
                                        value={input.address}
                                        onChange={changeEventHandler}
                                        placeholder="123 Main St"
                                    />
                                    {error.address && (
                                        <span className="text-red-500 text-sm">
                                            {error.address}
                                        </span>
                                    )}
                                </div>

                                {/* City & Country */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>City</Label>
                                        <Input
                                            type="text"
                                            name="city"
                                            value={input.city}
                                            onChange={changeEventHandler}
                                            placeholder="City"
                                        />
                                        {error.city && (
                                            <span className="text-red-500 text-sm">
                                                {error.city}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Country</Label>
                                        <Input
                                            type="text"
                                            name="country"
                                            value={input.country}
                                            onChange={changeEventHandler}
                                            placeholder="Country"
                                        />
                                        {error.country && (
                                            <span className="text-red-500 text-sm">
                                                {error.country}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Time & Cuisines */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Delivery Time (minutes)</Label>
                                        <Input
                                            type="number"
                                            name="deliveryTime"
                                            value={input.deliveryTime}
                                            onChange={changeEventHandler}
                                            placeholder="30"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <Label>Cuisines (comma-separated)</Label>
                                        <Input
                                            type="text"
                                            name="cuisines"
                                            value={input.cuisines}
                                            onChange={changeEventHandler}
                                            placeholder="Italian, Pasta, Pizza"
                                        />
                                    </div>
                                </div>

                                {/* Image */}
                                <div>
                                    <Label>Restaurant Image</Label>
                                    <Input
                                        type="file"
                                        name="imageFile"
                                        onChange={fileChangeHandler}
                                        accept="image/*"
                                    />
                                    {!isEditing && error.imageFile && (
                                        <span className="text-red-500 text-sm">
                                            {error.imageFile}
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
                                    disabled={loading}
                                    className="bg-orange hover:bg-hoverOrange"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? "Updating..." : "Creating..."}
                                        </>
                                    ) : isEditing ? (
                                        "Update Restaurant"
                                    ) : (
                                        "Create Restaurant"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Restaurants List */}
            {loading && !restaurants.length ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin h-8 w-8" />
                </div>
            ) : restaurants.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No restaurants created yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant._id}
                            className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                        >
                            {/* Image */}
                            <img
                                src={restaurant.imageUrl}
                                alt={restaurant.restaurantName}
                                className="w-full h-40 object-cover"
                            />

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg truncate">
                                    {restaurant.restaurantName}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {restaurant.description || "No description"}
                                </p>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>{restaurant.city}, {restaurant.country}</p>
                                    <p>Delivery: {restaurant.deliveryTime} mins</p>
                                    <p className="text-xs mt-1">
                                        {restaurant.cuisines.join(", ")}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className="mt-3 flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                            restaurant.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {restaurant.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    <Button
                                        size="sm"
                                        className="bg-orange hover:bg-hoverOrange"
                                        onClick={() => navigate(`/admin/menu/${restaurant._id}`)}
                                    >
                                        <Menu className="h-4 w-4 mr-1" />
                                        Menus
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(restaurant)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            toggleRestaurantStatus(
                                                restaurant._id
                                            )
                                        }
                                        disabled={loading}
                                    >
                                        {restaurant.isActive ? (
                                            <ToggleRight className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ToggleLeft className="h-4 w-4 text-red-600" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            handleDelete(restaurant._id)
                                        }
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
                        <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will soft delete the
                            restaurant from public view.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? (
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

export default RestaurantManagement;
