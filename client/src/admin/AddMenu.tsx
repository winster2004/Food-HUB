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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Settings,
} from "lucide-react";
import React, { FormEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditMenu from "./EditMenu";
import OptionManagement from "./OptionManagement";
import { MenuFormSchema, menuSchema } from "@/schema/menuSchema";
import { useMenuStore } from "@/store/useMenuStore";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useMenuItemStore } from "@/store/useMenuItemStore";

interface MenuItemForm {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: File;
}

interface MenuItemError {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
}

const AddMenu = () => {
  const { restaurantId } = useParams<{ restaurantId?: string }>();
  const navigate = useNavigate();

  // Legacy menu form state
  const [input, setInput] = useState<MenuFormSchema>({
    name: "",
    description: "",
    price: 0,
    image: undefined,
  });

  // Menu item form state for restaurant-specific management
  const [menuItemInput, setMenuItemInput] = useState<MenuItemForm>({
    name: "",
    description: "",
    price: 0,
    category: "",
  });

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<any>();
  const [error, setError] = useState<Partial<MenuFormSchema>>({});
  const [menuItemError, setMenuItemError] = useState<MenuItemError>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditingMenuItem, setIsEditingMenuItem] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);

  const { loading, createMenu, getMenus, menus, deleteMenu } = useMenuStore();
  const { restaurant } = useRestaurantStore();
  const {
    loading: itemLoading,
    menuItems,
    createMenuItem,
    updateMenuItem,
    getMenuByRestaurantId,
    deleteMenuItem,
    toggleMenuItemAvailability,
  } = useMenuItemStore();

  // Fetch menu items when viewing a specific restaurant's menu page
  useEffect(() => {
    if (restaurantId) {
      getMenuByRestaurantId(restaurantId);
    }
  }, [restaurantId, getMenuByRestaurantId]);

  // Fetch all menus for global menu view (when no restaurantId)
  useEffect(() => {
    if (!restaurantId) {
      getMenus();
    }
  }, [restaurantId, getMenus]);

  // === Legacy Menu Handlers ===
  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInput({ ...input, [name]: type === "number" ? Number(value) : value });
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = menuSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setError(fieldErrors as Partial<MenuFormSchema>);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("description", input.description);
      formData.append("price", input.price.toString());
      if (input.image) {
        formData.append("image", input.image);
      }
      await createMenu(formData);
      setOpen(false);
      setInput({ name: "", description: "", price: 0, image: undefined });
      // Success toast is handled in the store
    } catch (error) {
      console.error("[SUBMIT MENU ERROR]", error);
      // Error toast is handled in the store
    }
  };

  // === Menu Item Handlers ===
  const changeMenuItemEventHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setMenuItemInput({
      ...menuItemInput,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) setMenuItemInput({ ...menuItemInput, image: file });
  };

  const resetMenuItemForm = () => {
    setMenuItemInput({ name: "", description: "", price: 0, category: "" });
    setMenuItemError({});
    setIsEditingMenuItem(false);
    setEditingMenuItemId(null);
  };

  const submitMenuItemHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!menuItemInput.name || !menuItemInput.category || !restaurantId) {
      setMenuItemError({
        name: menuItemInput.name ? "" : "Name is required",
        category: menuItemInput.category ? "" : "Category is required",
      });
      return;
    }

    if (!isEditingMenuItem && !menuItemInput.image) {
      setMenuItemError({ ...menuItemError, image: "Image is required" });
      return;
    }

    const formData = new FormData();
    formData.append("name", menuItemInput.name);
    formData.append("description", menuItemInput.description);
    formData.append("price", menuItemInput.price.toString());
    formData.append("category", menuItemInput.category);
    formData.append("restaurantId", restaurantId);
    if (menuItemInput.image) formData.append("image", menuItemInput.image);

    try {
      if (isEditingMenuItem && editingMenuItemId) {
        await updateMenuItem(editingMenuItemId, formData);
        toast.success("Menu item updated successfully");
      } else {
        await createMenuItem(formData);
        toast.success("Menu item created successfully");
      }
      setMenuItemDialogOpen(false);
      resetMenuItemForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save menu item");
    }
  };

  const handleEditMenuItem = (item: any) => {
    setMenuItemInput({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    });
    setEditingMenuItemId(item._id);
    setIsEditingMenuItem(true);
    setMenuItemDialogOpen(true);
  };

  const handleDeleteMenuItem = (menuItemId: string) => {
    setDeleteId(menuItemId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMenuItem = async () => {
    if (!deleteId) return;
    try {
      await deleteMenuItem(deleteId);
      toast.success("Menu item deleted successfully");
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const handleManageOptions = (menuItem: any) => {
    setSelectedMenuItem(menuItem);
    setShowOptions(true);
  };

  // Show options manager
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

  // === Restaurant-specific menu management ===
  if (restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/restaurant")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                <p className="text-gray-600">Add, update, or delete menu items for this restaurant.</p>
              </div>
            </div>
            <Dialog open={menuItemDialogOpen} onOpenChange={setMenuItemDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-orange hover:bg-hoverOrange flex items-center gap-2"
                  onClick={resetMenuItemForm}
                >
                  <Plus size={18} />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {isEditingMenuItem ? "Edit Menu Item" : "Add Menu Item"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditingMenuItem
                      ? "Update the menu item details"
                      : "Create a new menu item for your restaurant"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={submitMenuItemHandler} className="space-y-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input
                      type="text"
                      name="name"
                      value={menuItemInput.name}
                      onChange={changeMenuItemEventHandler}
                      placeholder="e.g., Margherita Pizza"
                    />
                    {menuItemError.name && (
                      <span className="text-xs text-red-600 font-medium mt-1 block">
                        {menuItemError.name}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label>Description</Label>
                    <textarea
                      name="description"
                      value={menuItemInput.description}
                      onChange={changeMenuItemEventHandler}
                      placeholder="Describe your menu item"
                      className="w-full border rounded p-2 h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        name="price"
                        value={menuItemInput.price}
                        onChange={changeMenuItemEventHandler}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Input
                        type="text"
                        name="category"
                        value={menuItemInput.category}
                        onChange={changeMenuItemEventHandler}
                        placeholder="e.g., Pizza"
                      />
                      {menuItemError.category && (
                        <span className="text-xs text-red-600 font-medium mt-1 block">
                          {menuItemError.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Image {!isEditingMenuItem && "*"}</Label>
                    <Input
                      type="file"
                      name="image"
                      onChange={fileChangeHandler}
                      accept="image/*"
                    />
                    {!isEditingMenuItem && menuItemError.image && (
                      <span className="text-xs text-red-600 font-medium mt-1 block">
                        Image is required
                      </span>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setMenuItemDialogOpen(false);
                        resetMenuItemForm();
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
                          {isEditingMenuItem ? "Updating..." : "Creating..."}
                        </>
                      ) : isEditingMenuItem ? (
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

          {/* Menu Items List */}
          {itemLoading && !menuItems.length ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-orange" />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg">
                No menu items yet. Create your first menu item!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description || "No description"}
                    </p>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-orange">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Available</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleMenuItemAvailability(item._id)}
                        disabled={itemLoading}
                        title="Toggle availability"
                      >
                        {item.isAvailable ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-red-600" />
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMenuItem(item)}
                        title="Edit"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageOptions(item)}
                        title="Manage Options"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Settings size={16} />
                        Options
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMenuItem(item._id)}
                        title="Delete"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove the menu item from your restaurant. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteMenuItem}
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
  }

  // === Legacy menu management (backward compatible) ===
  return (
    <div className="max-w-6xl mx-auto my-10">
      <div className="flex justify-between">
        <h1 className="font-bold md:font-extrabold text-lg md:text-2xl">Available Menus</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange hover:bg-hoverOrange">
              <Plus className="mr-2" />
              Add Menus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add A New Menu</DialogTitle>
              <DialogDescription>
                Create a menu that will make your restaurant stand out.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={input.name}
                  onChange={changeEventHandler}
                  placeholder="Enter menu name"
                />
                {error.name && (
                  <span className="text-xs font-medium text-red-600">
                    {error.name}
                  </span>
                )}
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  name="description"
                  value={input.description}
                  onChange={(e) => setInput({ ...input, description: e.target.value })}
                  placeholder="Enter menu description"
                  className="w-full border rounded p-2 h-20"
                />
                {error.description && (
                  <span className="text-xs font-medium text-red-600">
                    {error.description}
                  </span>
                )}
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  name="price"
                  value={input.price}
                  onChange={changeEventHandler}
                  placeholder="Enter menu price"
                />
                {error.price && (
                  <span className="text-xs font-medium text-red-600">
                    {error.price}
                  </span>
                )}
              </div>
              <div>
                <Label>Upload Image</Label>
                <Input
                  onChange={(e) => setInput({ ...input, image: e.target.files?.[0] })}
                  type="file"
                  accept="image/*"
                  name="image"
                />
                {error.image && (
                  <span className="text-xs font-medium text-red-600">
                    Image is required
                  </span>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-orange hover:bg-hoverOrange">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Menu"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        {/* Display global menus when no restaurantId, otherwise show restaurant-specific menus */}
        {!restaurantId && menus && menus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu: any) => (
              <div key={menu._id} className="border rounded-lg overflow-hidden">
                {menu.image && (
                  <img src={menu.image} alt={menu.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{menu.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{menu.description}</p>
                  <p className="font-bold text-lg text-orange mt-2">${menu.price.toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        setSelectedMenu(menu);
                        setEditOpen(true);
                      }}
                      size="sm"
                      className="bg-orange hover:bg-hoverOrange flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteMenuId(menu._id)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurantId && restaurant && restaurant.menus && restaurant.menus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurant.menus.map((menu: any) => (
              <div key={menu._id} className="border rounded-lg overflow-hidden">
                {menu.image && (
                  <img src={menu.image} alt={menu.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{menu.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{menu.description}</p>
                  <p className="font-bold text-lg text-orange mt-2">${menu.price.toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        setSelectedMenu(menu);
                        setEditOpen(true);
                      }}
                      size="sm"
                      className="bg-orange hover:bg-hoverOrange flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteMenuId(menu._id)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No menus created yet. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteMenuId} onOpenChange={(open) => !open && setDeleteMenuId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteMenuId) {
                  deleteMenu(deleteMenuId);
                  setDeleteMenuId(null);
                }
              }}
              className="bg-destructive hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditMenu selectedMenu={selectedMenu} editOpen={editOpen} setEditOpen={setEditOpen} />
    </div>
  );
};

export default AddMenu;
