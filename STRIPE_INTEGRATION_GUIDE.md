# Stripe Payment Integration - Complete Guide

## Overview
This implementation provides a full end-to-end Stripe payment and order management system for the Food Hub application. The system handles checkout, payment processing, order tracking, and admin management.

## Features Implemented

### ✅ Payment Flow
- **Stripe Checkout Session**: Hosted checkout page with test mode support
- **Test Card Integration**: Use card `4242 4242 4242 4242` with any future date and CVC
- **Automatic Redirection**: Success → `/order/status`, Cancel → `/cart`
- **Payment Status Tracking**: Real-time payment status (pending/completed/failed)

### ✅ Order Management
- **Order Creation**: Orders created only after successful payment
- **Order Status Flow**: PENDING → CONFIRMED → PREPARING → OUT FOR DELIVERY → DELIVERED
- **Payment Status**: PENDING → COMPLETED/FAILED
- **Unique Order IDs**: Each order has a unique identifier
- **Stripe Session Tracking**: Orders linked to Stripe session IDs

### ✅ Customer Features
- **My Orders Page**: View all orders with status and payment info
- **Order Details Page**: Detailed tracking with timeline visualization
- **Order Timeline**: Visual progress tracker showing current status
- **Success Page**: Beautiful confirmation with order summary
- **Cancel Page**: Payment cancellation handling

### ✅ Admin Features
- **Orders Overview**: View all restaurant orders
- **Status Management**: Update order status via dropdown
- **Payment Tracking**: See payment status for each order
- **Order Details**: Customer info, items, and delivery details

### ✅ Webhook Integration
- **Stripe Webhooks**: Listen for `checkout.session.completed` events
- **Secure Verification**: Signature verification for webhook security
- **Automatic Updates**: Order status updated automatically on payment
- **Test Mode Support**: Works with Stripe CLI for local testing

## Setup Instructions

### 1. Environment Variables

Make sure your `.env` file has the following Stripe-related variables:

```env


# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=your_mongodb_connection_string

# Other keys (already configured)
CLOUDINARY_*
JWT_SECRET
MAILTRAP_*
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 3. Run the Application

```bash
# Terminal 1: Start backend server
cd server
npm run dev
# Server runs on http://localhost:3000

# Terminal 2: Start frontend
cd client
npm run dev
# Client runs on http://localhost:5173
```

### 4. Set Up Stripe Webhooks (For Local Testing)

```bash
# Terminal 3: Start Stripe CLI webhook forwarding
stripe listen --forward-to localhost:3000/api/v1/order/webhook

# Copy the webhook signing secret (starts with whsec_)
# Add it to server/.env as WEBHOOK_ENDPOINT_SECRET
```

## Testing the Payment Flow

### Test Card Details
- **Card Number**: `4242 4242 4242 4242`
- **Expiry Date**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Complete Test Scenario

1. **Browse & Add to Cart**
   - Navigate to home page
   - Browse restaurants
   - Add menu items to cart

2. **Proceed to Checkout**
   - Click "Proceed to Checkout" in cart
   - Fill in delivery details
   - Click "Continue to Payment"

3. **Stripe Payment**
   - You'll be redirected to Stripe Checkout (blue/white UI)
   - Enter test card: `4242 4242 4242 4242`
   - Enter any future expiry (12/34)
   - Enter any CVC (123)
   - Click "Pay"

4. **Payment Success**
   - Redirected to `/order/status`
   - See success message with:
     - Order ID
     - Payment Status: PAID
     - Estimated delivery time
     - Order summary
     - Delivery address

5. **View Orders**
   - Go to Profile → "My Orders" button
   - See all your orders
   - Click "View Details" on any order

6. **Track Order**
   - Order detail page shows:
     - Visual timeline of order status
     - Order items
     - Payment info
     - Delivery details

7. **Admin Management** (if you're an admin)
   - Go to `/admin/orders`
   - See all orders for your restaurant
   - Update order status via dropdown
   - Changes reflect in real-time

### Test Payment Cancellation

1. Follow steps 1-2 above
2. In Stripe Checkout, click the back arrow or close the window
3. You'll be redirected to `/order/cancel`
4. See cancellation message
5. Option to return to cart or browse restaurants

## API Endpoints

### Customer Endpoints
```
GET    /api/v1/order/                          - Get all user orders
GET    /api/v1/order/:orderId                   - Get single order by ID
POST   /api/v1/order/checkout/create-checkout-session - Create Stripe session
```

### Admin Endpoints
```
GET    /api/v1/restaurant/order                 - Get restaurant orders
PUT    /api/v1/restaurant/order/:orderId/status - Update order status
```

### Webhook Endpoint
```
POST   /api/v1/order/webhook                    - Stripe webhook listener
```

## Order Status Flow

```
PENDING (Order placed)
   ↓
CONFIRMED (Payment successful)
   ↓
PREPARING (Restaurant preparing food)
   ↓
OUT FOR DELIVERY (Order dispatched)
   ↓
DELIVERED (Order completed)
```

## Payment Status Flow

```
PENDING (Checkout initiated)
   ↓
COMPLETED (Payment successful) → Order confirmed
   ↓
FAILED (Payment failed) → Order cancelled
```

## Frontend Routes

```
/                          - Home page
/cart                      - Shopping cart
/order/status              - Payment success page
/order/cancel              - Payment cancellation page
/order/:orderId            - Order detail/tracking page
/my-orders                 - Customer orders list
/profile                   - User profile (with "My Orders" button)
/admin/orders              - Admin orders management
```

## File Structure

### Backend
```
server/
├── controller/
│   └── order.controller.ts       # Order & payment logic
├── models/
│   └── order.model.ts             # Order schema with payment fields
├── routes/
│   └── order.route.ts             # Order API routes
└── utils/
    └── stripe.ts                  # Stripe configuration
```

### Frontend
```
client/src/
├── components/
│   ├── Success.tsx                # Payment success page
│   ├── PaymentCancel.tsx          # Payment cancel page
│   ├── OrderDetail.tsx            # Single order tracking
│   ├── MyOrders.tsx               # Customer orders list
│   └── CheckoutConfirmPage.tsx    # Checkout dialog
├── admin/
│   └── Orders.tsx                 # Admin orders management
├── store/
│   └── useOrderStore.ts           # Order state management
└── types/
    └── orderType.ts               # TypeScript types
```

## Troubleshooting

### Webhook Not Working
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/v1/order/webhook`
- Check `WEBHOOK_ENDPOINT_SECRET` in `.env`
- Restart the server after adding the secret

### Payment Redirects to Wrong URL
- Verify `FRONTEND_URL` in server `.env` is `http://localhost:5173`
- Check CORS settings in `server/index.ts`

### CORS Errors
- Ensure client API base URL is `http://localhost:3000`
- Check `FRONTEND_URL` in server `.env`
- Restart both client and server

### Orders Not Showing
- Check MongoDB connection
- Verify user is logged in
- Check browser console for errors

## Production Deployment

### Before Deploying

1. **Switch to Live Stripe Keys**
   ```env
   STRIPE_SECRET_KEY=sk_live_your_live_key
   ```

2. **Set Production Webhook Secret**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/v1/order/webhook`
   - Copy webhook secret to `WEBHOOK_ENDPOINT_SECRET`

3. **Update Frontend URL**
   ```env
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Update Client Environment**
   ```env
   # client/.env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

## Security Best Practices

✅ **Implemented:**
- Webhook signature verification
- Authentication required for all order endpoints
- User can only view their own orders
- Payment amount verified server-side
- Stripe session IDs stored securely
- Environment variables for sensitive data

## Support

For issues or questions:
- Check server logs for errors
- Check browser console for frontend errors
- Verify all environment variables are set
- Ensure Stripe CLI is running for webhooks

## Test Results Checklist

- [x] Payment with test card succeeds
- [x] Success page shows order details
- [x] Order appears in My Orders
- [x] Order detail page shows timeline
- [x] Payment cancellation works
- [x] Webhook updates order status
- [x] Admin can see all orders
- [x] Admin can update order status
- [x] Payment status tracked correctly
- [x] Stripe session ID saved to order

---

**🎉 Your Stripe payment integration is now complete and ready to use!**
