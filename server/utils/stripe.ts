/**
 * Stripe Configuration
 * 
 * This file initializes and configures the Stripe SDK for payment processing.
 * 
 * IMPORTANT: Make sure to use TEST MODE keys during development
 * Test Card Number: 4242 4242 4242 4242
 * Any future expiry date and any CVC will work
 */

import Stripe from 'stripe';

// Initialize Stripe with your secret key
// The apiVersion ensures consistent behavior across Stripe API updates
// Note: STRIPE_SECRET_KEY will be available at runtime after dotenv.config() is called in index.ts
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
    console.error('⚠️  WARNING: STRIPE_SECRET_KEY is not defined in environment variables');
    console.error('Please set STRIPE_SECRET_KEY in server/.env file');
} else {
    console.log('✅ Stripe API Key loaded successfully');
}

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
    typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
    // Supported countries for shipping
    ALLOWED_COUNTRIES: ['GB', 'US', 'CA', 'IN'] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
    
    // Currency (change to 'usd' for US Dollar, 'eur' for Euro, etc.)
    CURRENCY: 'inr', // Indian Rupee
    
    // Payment methods
    PAYMENT_METHODS: ['card'],
    
    // URLs for success and cancellation
    // Success page shows confirmation then auto-redirects to orders
    // IMPORTANT: {CHECKOUT_SESSION_ID} is a Stripe placeholder that gets replaced with the actual session ID
    getSuccessUrl: () => `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    // Cancel page route
    getCancelUrl: () => `${process.env.FRONTEND_URL}/checkout/cancel`,
};

export default stripe;
