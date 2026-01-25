import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_END_POINT = `${API_BASE}/api/v1/menu-item`;
axios.defaults.withCredentials = true;

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isAvailable: boolean;
    restaurantId: string;
    options: string[];
    createdAt: string;
    updatedAt: string;
}

type MenuItemState = {
    loading: boolean;
    menuItems: MenuItem[];
    currentMenuItem: MenuItem | null;
    createMenuItem: (formData: FormData) => Promise<void>;
    updateMenuItem: (menuItemId: string, formData: FormData) => Promise<void>;
    getMenuByRestaurantId: (restaurantId: string) => Promise<void>;
    deleteMenuItem: (menuItemId: string) => Promise<void>;
    toggleMenuItemAvailability: (menuItemId: string) => Promise<void>;
};

export const useMenuItemStore = create<MenuItemState>()(
    persist(
        (set, get) => ({
            loading: false,
            menuItems: [],
            currentMenuItem: null,

            createMenuItem: async (formData: FormData) => {
                try {
                    set({ loading: true });
                    const response = await axios.post(`${API_END_POINT}/`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            menuItems: [
                                response.data.menuItem,
                                ...get().menuItems,
                            ],
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to create menu item"
                    );
                    set({ loading: false });
                }
            },

            updateMenuItem: async (menuItemId: string, formData: FormData) => {
                try {
                    set({ loading: true });
                    const response = await axios.put(
                        `${API_END_POINT}/${menuItemId}`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            menuItems: get().menuItems.map((item) =>
                                item._id === menuItemId
                                    ? response.data.menuItem
                                    : item
                            ),
                            currentMenuItem:
                                get().currentMenuItem?._id === menuItemId
                                    ? response.data.menuItem
                                    : get().currentMenuItem,
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to update menu item"
                    );
                    set({ loading: false });
                }
            },

            getMenuByRestaurantId: async (restaurantId: string) => {
                try {
                    set({ loading: true });
                    const response = await axios.get(
                        `${API_END_POINT}/restaurant/${restaurantId}`
                    );
                    if (response.data.success) {
                        set({
                            loading: false,
                            menuItems: response.data.menuItems || [],
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to fetch menu items"
                    );
                    set({ loading: false });
                }
            },

            deleteMenuItem: async (menuItemId: string) => {
                try {
                    set({ loading: true });
                    const response = await axios.delete(
                        `${API_END_POINT}/${menuItemId}`
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            menuItems: get().menuItems.filter(
                                (item) => item._id !== menuItemId
                            ),
                            currentMenuItem:
                                get().currentMenuItem?._id === menuItemId
                                    ? null
                                    : get().currentMenuItem,
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to delete menu item"
                    );
                    set({ loading: false });
                }
            },

            toggleMenuItemAvailability: async (menuItemId: string) => {
                try {
                    set({ loading: true });
                    const response = await axios.patch(
                        `${API_END_POINT}/${menuItemId}/toggle-availability`
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            menuItems: get().menuItems.map((item) =>
                                item._id === menuItemId
                                    ? { ...item, isAvailable: response.data.menuItem.isAvailable }
                                    : item
                            ),
                            currentMenuItem:
                                get().currentMenuItem?._id === menuItemId
                                    ? response.data.menuItem
                                    : get().currentMenuItem,
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to update availability"
                    );
                    set({ loading: false });
                }
            },
        }),
        {
            name: "menu-item-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
