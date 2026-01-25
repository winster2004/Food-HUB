import { CheckoutSessionRequest, OrderState } from "@/types/orderType";
import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_ORDER: string = `${API_BASE}/api/v1/order`;
const API_PAYMENT: string = `${API_BASE}/api/payment`;
axios.defaults.withCredentials = true;

export const useOrderStore = create<OrderState>()(persist((set => ({
    loading: false,
    orders: [],
    createCheckoutSession: async (checkoutSession: CheckoutSessionRequest) => {
        set({ loading: true });
        try {
            console.log('📤 Sending checkout request to:', `${API_PAYMENT}/create-checkout-session`);
            console.log('📦 Request data:', checkoutSession);
            
            // Prefer mandatory payment endpoint, fallback to legacy if needed
            const response = await axios.post(`${API_PAYMENT}/create-checkout-session`, checkoutSession, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });
            
            console.log('✅ Response received - Status:', response.status);
            console.log('✅ Full response data:', JSON.stringify(response.data, null, 2));
            
            // The server returns { session } where session is the Stripe session object
            const session = response.data?.session;
            const sessionUrl = session?.url;
            
            console.log('📋 Session object:', session);
            console.log('🔗 Session URL:', sessionUrl);
            
            if (!sessionUrl) {
                console.error('❌ No session URL found in response');
                console.error('Response structure:', Object.keys(response.data || {}));
                throw new Error(`Unable to create Stripe session. Response: ${JSON.stringify(response.data)}`);
            }
            
            console.log('🔄 Redirecting to Stripe:', sessionUrl);
            // Redirect happens immediately, loading state stays true
            window.location.href = sessionUrl;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create checkout session';
            console.error('❌ Checkout session error:', errorMessage);
            console.error('Error details:', error);
            set({ loading: false });
            throw new Error(errorMessage);
        }
    },
    getOrderDetails: async () => {
        try {
            set({loading:true});
            const response = await axios.get(`${API_ORDER}/`);
          
            set({loading:false, orders:response.data.orders});
        } catch (error) {
            set({loading:false});
        }
    },
    getOrderById: async (orderId: string) => {
        try {
            set({ loading: true });
            const response = await axios.get(`${API_ORDER}/${orderId}`);
            set({ loading: false });
            return response.data.order;
        } catch (error) {
            set({ loading: false });
            return null;
        }
    }
})), {
    name: 'order-name',
    storage: createJSONStorage(() => localStorage)
}))