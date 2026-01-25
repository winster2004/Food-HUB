`# 🚀 Quick Start Guide - Stripe Payment Integration

## Prerequisites
- Node.js installed
- MongoDB running
- Stripe CLI (optional, for webhook testing)

## 1. Start the Application

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```
✅ Server should start on `http://localhost:3000`
✅ You should see: "Server listen at port 3000" and "mongoDB connected."

### Terminal 2 - Frontend Client
```bash
cd client
npm run dev
```
✅ Client should start on `http://localhost:5173`

### Terminal 3 - Stripe Webhooks (Optional)
```bash
stripe listen --forward-to localhost:3000/api/v1/order/webhook
```
📋 **Important:** Copy the webhook signing secret (starts with `whsec_`) and update it in `server/.env`:
```env
WEBHOOK_ENDPOINT_SECRET=whsec_your_secret_here
```

## 2. Test the Payment Flow

### Step 1: Create an Account
1. Go to `http://localhost:5173/signup`
2. Create a new account
3. Verify your email (check Mailtrap inbox)

### Step 2: Browse & Add Items
1. Browse restaurants on the home page
2. Click on a restaurant
3. Add menu items to cart

### Step 3: Checkout
1. Click "Proceed to Checkout" in cart
2. Fill in delivery details:
   - Name
   - Address
   - City
   - Country
3. Click "Continue to Payment"

### Step 4: Pay with Test Card
You'll be redirected to Stripe Checkout. Use these test details:

```
Card Number: 4242 4242 4242 4242
Expiry Date: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

### Step 5: Success!
- You'll be redirected to the success page
- See your order details, payment status (PAID), and estimated delivery
- Click "View All Orders" to see order history

## 3. Track Your Order

### View All Orders
1. Click profile icon → "My Orders"
2. See all your orders with status

### View Order Details
1. Click "View Details" on any order
2. See:
   - Order timeline (visual progress)
   - Order items
   - Payment status
   - Delivery information

## 4. Test Payment Cancellation

1. Add items to cart
2. Proceed to checkout
3. In Stripe Checkout, click the back arrow or close the window
4. You'll be redirected to the cancel page
5. Click "Return to Cart" to try again

## 5. Admin Features (Restaurant Owner)

If your account is an admin:

1. Go to `/admin/orders`
2. See all orders for your restaurant
3. Update order status:
   - Pending → Confirmed
   - Confirmed → Preparing
   - Preparing → Out for Delivery
   - Out for Delivery → Delivered

## Troubleshooting

### Payment not completing?
- Check if all three terminals are running
- Verify Stripe CLI is forwarding webhooks
- Check server logs for errors

### Can't see orders?
- Make sure you're logged in
- Check MongoDB connection
- Verify MONGO_URI in server/.env

### CORS errors?
- Check FRONTEND_URL in server/.env is `http://localhost:5173`
- Restart both server and client

## Key Features to Test

✅ **Payment Flow**
- [ ] Add items to cart
- [ ] Checkout with delivery details
- [ ] Pay with test card `4242 4242 4242 4242`
- [ ] See success page with order details
- [ ] Order shows in "My Orders"

✅ **Order Tracking**
- [ ] View all orders
- [ ] Click order to see details
- [ ] See order timeline visualization
- [ ] Payment status shows "PAID"

✅ **Payment Cancellation**
- [ ] Start checkout
- [ ] Cancel payment in Stripe
- [ ] Redirected to cancel page
- [ ] No charge made

✅ **Admin Management**
- [ ] View all restaurant orders
- [ ] Update order status
- [ ] See payment status
- [ ] View customer details

✅ **Webhooks**
- [ ] Stripe CLI running
- [ ] Payment completion triggers webhook
- [ ] Order status updated to "confirmed"
- [ ] Payment status updated to "completed"

## URLs Reference

- **Client**: http://localhost:5173
- **Server**: http://localhost:3000
- **Success Page**: http://localhost:5173/order/status
- **Cancel Page**: http://localhost:5173/order/cancel
- **My Orders**: http://localhost:5173/my-orders
- **Admin Orders**: http://localhost:5173/admin/orders

## Test Card Numbers (Stripe Test Mode)

| Card Number | Result |
|------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0025 0000 3155 | Requires authentication |

## Environment Check

Make sure these are set in `server/.env`:
```env
✅ MONGO_URI - MongoDB connection
✅ STRIPE_SECRET_KEY - Stripe test key (starts with sk_test_)
✅ WEBHOOK_ENDPOINT_SECRET - Webhook secret (starts with whsec_)
✅ FRONTEND_URL - http://localhost:5173
✅ JWT_SECRET - Any random string
```

## Next Steps

1. ✅ Test the complete payment flow
2. ✅ Verify webhooks are working
3. ✅ Test order tracking
4. ✅ Test admin order management
5. 📖 Read STRIPE_INTEGRATION_GUIDE.md for full documentation

---

**Happy Testing! 🎉**

Need help? Check the server logs or browser console for error messages.
