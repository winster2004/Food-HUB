import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_END_POINT = `${API_BASE}/api/v1/restaurant-management`;
axios.defaults.withCredentials = true;

interface Restaurant {
    _id: string;
    restaurantName: string;
    description: string;
    address: string;
    city: string;
    country: string;
    deliveryTime: number;
    cuisines: string[];
    imageUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

type RestaurantManagementState = {
    loading: boolean;
    restaurants: Restaurant[];
    currentRestaurant: Restaurant | null;
    createRestaurant: (formData: FormData) => Promise<void>;
    updateRestaurant: (restaurantId: string, formData: FormData) => Promise<void>;
    getAllRestaurants: () => Promise<void>;
    getRestaurantById: (id: string) => Promise<void>;
    getCurrentUserRestaurant: () => Promise<void>;
    deleteRestaurant: (restaurantId: string) => Promise<void>;
    toggleRestaurantStatus: (restaurantId: string) => Promise<void>;
};

export const useRestaurantManagementStore = create<RestaurantManagementState>()(
    persist(
        (set, get) => ({
            loading: false,
            restaurants: [],
            currentRestaurant: null,

            createRestaurant: async (formData: FormData) => {
                try {
                    set({ loading: true });
                    const response = await axios.post(`${API_END_POINT}/`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({ loading: false, currentRestaurant: response.data.restaurant });
                        // Refresh the full list to include the new restaurant
                        get().getAllRestaurants();
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to create restaurant"
                    );
                    set({ loading: false });
                }
            },

            updateRestaurant: async (restaurantId: string, formData: FormData) => {
                try {
                    set({ loading: true });
                    const response = await axios.put(
                        `${API_END_POINT}/${restaurantId}`,
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
                            currentRestaurant: response.data.restaurant,
                        });
                        // Refresh the full list to sync updates
                        get().getAllRestaurants();
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to update restaurant"
                    );
                    set({ loading: false });
                }
            },

            getAllRestaurants: async () => {
                try {
                    set({ loading: true });
                    const response = await axios.get(
                        `${API_END_POINT}/list/all`
                    );
                    if (response.data.success) {
                        set({
                            loading: false,
                            restaurants: response.data.restaurants || [],
                        });
                    }
                } catch (error: any) {
                    console.error("[GET ALL RESTAURANTS ERROR]", error);
                    // Don't show error toast if we already have persisted data
                    const currentState = get();
                    if (currentState.restaurants && currentState.restaurants.length === 0) {
                        toast.error(
                            error.response?.data?.message || "Failed to fetch restaurants"
                        );
                    }
                    set({ loading: false });
                    // Data persists in localStorage even if API fails
                }
            },

            getRestaurantById: async (id: string) => {
                try {
                    set({ loading: true });
                    const response = await axios.get(`${API_END_POINT}/${id}`);
                    if (response.data.success) {
                        set({
                            loading: false,
                            currentRestaurant: response.data.restaurant,
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to fetch restaurant"
                    );
                    set({ loading: false });
                }
            },

            getCurrentUserRestaurant: async () => {
                try {
                    set({ loading: true });
                    const response = await axios.get(
                        `${API_END_POINT}/my/restaurant`
                    );
                    if (response.data.success) {
                        const restaurants = response.data.restaurants || [];
                        set({
                            loading: false,
                            restaurants: restaurants,
                            currentRestaurant: restaurants.length > 0 ? restaurants[0] : null,
                        });
                    }
                } catch (error: any) {
                    // Restaurant might not exist yet
                    set({ loading: false, restaurants: [], currentRestaurant: null });
                }
            },

            deleteRestaurant: async (restaurantId: string) => {
                try {
                    set({ loading: true });
                    const response = await axios.delete(
                        `${API_END_POINT}/${restaurantId}`
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            restaurants: (get().restaurants as Restaurant[]).filter(
                                (r: Restaurant) => r._id !== restaurantId
                            ),
                            currentRestaurant:
                                (get().currentRestaurant as Restaurant)?._id === restaurantId
                                    ? null
                                    : (get().currentRestaurant as Restaurant),
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to delete restaurant"
                    );
                    set({ loading: false });
                }
            },

            toggleRestaurantStatus: async (restaurantId: string) => {
                try {
                    set({ loading: true });
                    const response = await axios.patch(
                        `${API_END_POINT}/${restaurantId}/toggle-status`
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        // Update in local state
                        set({
                            loading: false,
                            restaurants: (get().restaurants as Restaurant[]).map(
                                (r: Restaurant) =>
                                    r._id === restaurantId
                                        ? { ...r, isActive: response.data.restaurant.isActive }
                                        : r
                            ),
                            currentRestaurant:
                                (get().currentRestaurant as Restaurant)?._id === restaurantId
                                    ? response.data.restaurant
                                    : (get().currentRestaurant as Restaurant),
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to toggle status"
                    );
                    set({ loading: false });
                }
            },
        }),
        {
            name: "restaurant-management-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
