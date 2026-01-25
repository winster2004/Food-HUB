import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useRestaurantStore } from "./useRestaurantStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_END_POINT = `${API_BASE}/api/v1/menu`;
axios.defaults.withCredentials = true;

type MenuState = {
    loading: boolean,
    menu: null,
    menus: any[],
    createMenu: (formData: FormData) => Promise<void>;
    editMenu: (menuId: string, formData: FormData) => Promise<void>;
    getMenus: () => Promise<void>;
    deleteMenu: (menuId: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>()(persist((set) => ({
    loading: false,
    menu: null,
    menus: [],
    createMenu: async (formData: FormData) => {
        try {
            set({ loading: true });
            const response = await axios.post(`${API_END_POINT}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log("[CREATE MENU] Response:", response.data);
            
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false, menu: response.data.menu });
                // update restaurant 
                useRestaurantStore.getState().addMenuToRestaurant(response.data.menu);
                // Refresh menu list
                useMenuStore.getState().getMenus();
            } else {
                toast.error(response.data.message || "Failed to create menu");
                set({ loading: false });
            }
        } catch (error: any) {
            console.error("[CREATE MENU ERROR]", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to create menu";
            toast.error(errorMessage);
            set({ loading: false });
        }
    },
    editMenu: async (menuId:string,formData: FormData) => {
        try {
            set({ loading: true });
            const response = await axios.put(`${API_END_POINT}/${menuId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if(response.data.success){
             toast.success(response.data.message);
             set({loading:false, menu:response.data.menu});
             // update restaurant menu
             useRestaurantStore.getState().updateMenuToRestaurant(response.data.menu);
             // Refresh menu list
             useMenuStore.getState().getMenus();
            } else {
                toast.error(response.data.message || "Failed to update menu");
                set({ loading: false });
            }
        } catch (error: any) {
            console.error("[EDIT MENU ERROR]", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update menu";
            toast.error(errorMessage);
            set({ loading: false });
        }
    },
    getMenus: async () => {
        try {
            set({ loading: true });
            const response = await axios.get(`${API_END_POINT}/`);
            
            console.log("[GET MENUS] Response:", response.data);
            
            if (response.data.success) {
                set({ loading: false, menus: response.data.menus });
            } else {
                console.error("[GET MENUS] Failed:", response.data);
                set({ loading: false, menus: [] });
            }
        } catch (error: any) {
            console.error("[GET MENUS ERROR]", error);
            set({ loading: false, menus: [] });
        }
    },
    deleteMenu: async (menuId: string) => {
        try {
            set({ loading: true });
            const response = await axios.delete(`${API_END_POINT}/${menuId}`);
            
            console.log("[DELETE MENU] Response:", response.data);
            
            if (response.data.success) {
                toast.success(response.data.message);
                set({ loading: false });
                // Refresh menu list
                useMenuStore.getState().getMenus();
            } else {
                toast.error(response.data.message || "Failed to delete menu");
                set({ loading: false });
            }
        } catch (error: any) {
            console.error("[DELETE MENU ERROR]", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete menu";
            toast.error(errorMessage);
            set({ loading: false });
        }
    },
}), {
    name: "menu-name",
    storage: createJSONStorage(() => localStorage)
}))