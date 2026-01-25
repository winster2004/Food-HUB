import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_END_POINT = `${API_BASE}/api/v1/option`;
axios.defaults.withCredentials = true;

interface Option {
    _id: string;
    name: string;
    price: number;
    isRequired: boolean;
    menuItemId: string;
    createdAt: string;
    updatedAt: string;
}

type OptionState = {
    loading: boolean;
    options: Option[];
    createOption: (data: {
        menuItemId: string;
        name: string;
        price: number;
        isRequired: boolean;
    }) => Promise<void>;
    updateOption: (
        optionId: string,
        data: Partial<Omit<Option, "_id" | "menuItemId" | "createdAt" | "updatedAt">>
    ) => Promise<void>;
    getOptionsByMenuItemId: (menuItemId: string) => Promise<Option[]>;
    deleteOption: (optionId: string) => Promise<void>;
    toggleOptionRequired: (optionId: string) => Promise<void>;
};

export const useOptionStore = create<OptionState>()(
    persist(
        (set, get) => ({
            loading: false,
            options: [],

            createOption: async (data) => {
                try {
                    set({ loading: true });
                    const response = await axios.post(`${API_END_POINT}/`, data);
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            options: [response.data.option, ...get().options],
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to create option"
                    );
                    set({ loading: false });
                }
            },

            updateOption: async (optionId, data) => {
                try {
                    set({ loading: true });
                    const response = await axios.put(
                        `${API_END_POINT}/${optionId}`,
                        data
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            options: get().options.map((opt) =>
                                opt._id === optionId ? response.data.option : opt
                            ),
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to update option"
                    );
                    set({ loading: false });
                }
            },

            getOptionsByMenuItemId: async (menuItemId) => {
                try {
                    set({ loading: true });
                    const response = await axios.get(
                        `${API_END_POINT}/menu-item/${menuItemId}`
                    );
                    if (response.data.success) {
                        set({
                            loading: false,
                            options: response.data.options || [],
                        });
                        return response.data.options || [];
                    }
                    return [];
                } catch (error: any) {
                    console.log(error);
                    set({ loading: false });
                    return [];
                }
            },

            deleteOption: async (optionId) => {
                try {
                    set({ loading: true });
                    const response = await axios.delete(
                        `${API_END_POINT}/${optionId}`
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            options: get().options.filter(
                                (opt) => opt._id !== optionId
                            ),
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to delete option"
                    );
                    set({ loading: false });
                }
            },

            toggleOptionRequired: async (optionId) => {
                try {
                    set({ loading: true });
                    const response = await axios.patch(
                        `${API_END_POINT}/${optionId}/toggle-required`
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        set({
                            loading: false,
                            options: get().options.map((opt) =>
                                opt._id === optionId
                                    ? {
                                          ...opt,
                                          isRequired: response.data.option.isRequired,
                                      }
                                    : opt
                            ),
                        });
                    }
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.message || "Failed to toggle option"
                    );
                    set({ loading: false });
                }
            },
        }),
        {
            name: "option-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
