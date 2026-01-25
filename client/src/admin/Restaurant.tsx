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
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import React, { FormEvent, useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import CuisinesInput from "@/components/CuisinesInput";
import {
  RestaurantFormSchema,
} from "@/schema/restaurantSchema";

const Restaurant = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState<RestaurantFormSchema>({
    restaurantName: "",
    description: "",
    address: "",
    city: "",
    country: "",
    deliveryTime: 0,
    cuisines: [],
    imageFile: undefined,
  });
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<RestaurantFormSchema>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    loading,
    restaurants,
    createRestaurant,
    updateRestaurant,
    getCurrentUserRestaurant,
    deleteRestaurant,
  } = useRestaurantManagementStore();

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    await getCurrentUserRestaurant();
  };

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
      setInput({ ...input, imageFile: file });
    }
  };

  const handleCuisinesChange = (cuisines: string[]) => {
    setInput({ ...input, cuisines });
  };

  const resetForm = () => {
    setInput({
      restaurantName: "",
      description: "",
      address: "",
      city: "",
      country: "",
      deliveryTime: 0,
      cuisines: [],
      imageFile: undefined,
    });
    setIsEditing(false);
    setEditingId(null);
    setErrors({});
  };

  const parseCuisines = (cuisines: any): string[] => {
    if (!cuisines) return [];
    
    // If it's already a clean array of strings, return it
    if (Array.isArray(cuisines) && cuisines.length > 0 && typeof cuisines[0] === 'string' && !cuisines[0].includes('"')) {
      return cuisines;
    }
    
    if (Array.isArray(cuisines)) {
      return cuisines.map((c) => {
        if (typeof c === "string") {
          // Remove all escape characters and quotes
          let cleaned = c.replace(/\\\\/g, '').replace(/\\"/g, '').replace(/"/g, '').trim();
          return cleaned;
        }
        return c;
      }).filter(item => item && item.length > 0);
    }
    
    if (typeof cuisines === 'string') {
      try {
        // Try parsing if it's a JSON string
        const parsed = JSON.parse(cuisines);
        if (Array.isArray(parsed)) {
          return parsed.map(c => String(c).replace(/\\\\/g, '').replace(/\\"/g, '').replace(/"/g, '').trim());
        }
        return [String(cuisines).replace(/\\\\/g, '').replace(/\\"/g, '').replace(/"/g, '').trim()];
      } catch {
        return [cuisines.replace(/\\\\/g, '').replace(/\\"/g, '').replace(/"/g, '').trim()];
      }
    }
    
    return [];
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.restaurantName || !input.address || !input.city || !input.country) {
      setErrors({
        restaurantName: input.restaurantName ? "" : "Name is required",
        address: input.address ? "" : "Address is required",
        city: input.city ? "" : "City is required",
        country: input.country ? "" : "Country is required",
      });
      return;
    }

    if (!isEditing && !input.imageFile) {
      setErrors({ ...errors, imageFile: "Image is required" });
      return;
    }

    const formData = new FormData();
    formData.append("restaurantName", input.restaurantName);
    formData.append("description", input.description || "");
    formData.append("address", input.address);
    formData.append("city", input.city);
    formData.append("country", input.country);
    formData.append("deliveryTime", input.deliveryTime.toString());
    formData.append("cuisines", JSON.stringify(input.cuisines));

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
      await fetchRestaurant();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (restaurant: any) => {
    setInput({
      restaurantName: restaurant.restaurantName,
      description: restaurant.description || "",
      address: restaurant.address,
      city: restaurant.city,
      country: restaurant.country,
      deliveryTime: restaurant.deliveryTime,
      cuisines: parseCuisines(restaurant.cuisines),
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
      await fetchRestaurant();
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-10">
      {/* HEADER - Matches Menu Page */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold md:font-extrabold text-lg md:text-2xl">
          Available Restaurants
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
                {isEditing ? "Edit Restaurant" : "Add a New Restaurant"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update restaurant details"
                  : "Create a new restaurant to manage menus."}
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
                  {errors.restaurantName && (
                    <span className="text-red-500 text-sm">
                      {errors.restaurantName}
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
                    placeholder="Brief description of your restaurant..."
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
                    placeholder="e.g., 123 Main Street"
                  />
                  {errors.address && (
                    <span className="text-red-500 text-sm">
                      {errors.address}
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
                      placeholder="e.g., New York"
                    />
                    {errors.city && (
                      <span className="text-red-500 text-sm">
                        {errors.city}
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
                      placeholder="e.g., USA"
                    />
                    {errors.country && (
                      <span className="text-red-500 text-sm">
                        {errors.country}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery Time */}
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

                {/* Cuisines */}
                <div>
                  <CuisinesInput
                    value={input.cuisines}
                    onChange={handleCuisinesChange}
                    error={
                      errors.cuisines && typeof errors.cuisines === "string"
                        ? errors.cuisines
                        : undefined
                    }
                  />
                </div>

                {/* Image */}
                <div>
                  <Label>Restaurant Banner Image</Label>
                  <Input
                    type="file"
                    name="imageFile"
                    onChange={fileChangeHandler}
                    accept="image/*"
                  />
                  {!isEditing && errors.imageFile && (
                    <span className="text-red-500 text-sm">
                      {typeof errors.imageFile === 'string' ? errors.imageFile : ''}
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

      {/* RESTAURANT LIST - Matches Menu Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : !restaurants || restaurants.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>No restaurants created yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <div
              key={rest._id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              {rest.imageUrl && (
                <img
                  src={rest.imageUrl}
                  alt={rest.restaurantName}
                  className="w-full h-40 object-cover"
                />
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg truncate mb-2">
                  {rest.restaurantName}
                </h3>
                {rest.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {rest.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold min-w-[80px]">Location:</span>
                    <span>{rest.city}, {rest.country}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold min-w-[80px]">Delivery:</span>
                    <span>{rest.deliveryTime} mins</span>
                  </div>
                  
                  {/* Cuisines - Clean Display */}
                  {rest.cuisines && rest.cuisines.length > 0 && (
                    <div className="flex items-start text-sm text-gray-600">
                      <span className="font-semibold min-w-[80px] mt-0.5">Cuisines:</span>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1.5">
                          {parseCuisines(rest.cuisines).map((cuisine, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-orange/10 text-orange px-2 py-0.5 rounded text-xs"
                            >
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      rest.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {rest.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(rest)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/restaurants/${rest._id}/menus`)}
                  >
                    Menu
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(rest._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the restaurant. This cannot be undone.
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

export default Restaurant;
