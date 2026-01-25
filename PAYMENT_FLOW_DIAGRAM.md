# 🔄 Payment Flow Diagram

## Complete End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                     │
└─────────────────────────────────────────────────────────────────────────┘

1. BROWSE & SHOP
   ┌──────────────┐
   │  Home Page   │ → Browse Restaurants
   └──────┬───────┘
          │
   ┌──────▼───────────┐
   │  Restaurant      │ → View Menu
   │  Detail Page     │
   └──────┬───────────┘
          │
   ┌──────▼───────┐
   │  Add to Cart │ → Select Items
   └──────┬───────┘
          │
   ┌──────▼───────┐
   │  Cart Page   │ → Review Items
   └──────┬───────┘
          │
          ▼

2. CHECKOUT PROCESS
   ┌─────────────────────────┐
   │  Checkout Dialog        │
   │  ─────────────────────  │
   │  • Name                 │
   │  • Email                │
   │  • Address              │
   │  • City, Country        │
   └──────────┬──────────────┘
              │
              │ Click "Continue to Payment"
              │
   ┌──────────▼──────────────┐
   │  Backend API            │
   │  POST /checkout/...     │
   │  ─────────────────────  │
   │  1. Create Order        │
   │     status: PENDING     │
   │     payment: PENDING    │
   │  2. Create Stripe       │
   │     Checkout Session    │
   │  3. Return session.url  │
   └──────────┬──────────────┘
              │
              │ Redirect to Stripe
              │
              ▼

3. STRIPE PAYMENT
   ┌───────────────────────────────┐
   │  STRIPE CHECKOUT PAGE         │
   │  ───────────────────────────  │
   │  🎨 Blue/White Stripe UI      │
   │                               │
   │  Card Number: 4242...         │
   │  Expiry: 12/34                │
   │  CVC: 123                     │
   │                               │
   │  [Pay Now] button             │
   └────────┬──────────────────────┘
            │
            ├─── SUCCESS ────────────┐
            │                        │
            │                        ▼
            │              ┌──────────────────┐
            │              │  Stripe Webhook  │
            │              │  ──────────────  │
            │              │  POST /webhook   │
            │              │  Event:          │
            │              │  checkout.       │
            │              │  session.        │
            │              │  completed       │
            │              └────────┬─────────┘
            │                       │
            │                       │ Update Order
            │                       │
            │              ┌────────▼─────────┐
            │              │  Order Updated   │
            │              │  ──────────────  │
            │              │  status:         │
            │              │    CONFIRMED     │
            │              │  paymentStatus:  │
            │              │    COMPLETED     │
            │              │  totalAmount:    │
            │              │    saved         │
            │              └──────────────────┘
            │
            │ Redirect to success_url
            │
   ┌────────▼──────────────┐
   │  SUCCESS PAGE         │
   │  /order/status        │
   │  ───────────────────  │
   │  ✅ Payment Success   │
   │  Order ID: #XYZ123    │
   │  Payment: PAID        │
   │  Est. Delivery: 45min │
   │                       │
   │  [View All Orders]    │
   └────────┬──────────────┘
            │
            │
            │
   ┌────────▼──────────────┐
   │  OR                   │
   └───────────────────────┘
            │
            └─── CANCEL/FAIL ───────┐
                                    │
                           ┌────────▼──────────┐
                           │  CANCEL PAGE      │
                           │  /order/cancel    │
                           │  ───────────────  │
                           │  ❌ Payment       │
                           │     Cancelled     │
                           │                   │
                           │  [Return to Cart] │
                           └───────────────────┘

4. ORDER TRACKING
   ┌─────────────────────────┐
   │  Profile → My Orders    │
   └──────────┬──────────────┘
              │
   ┌──────────▼──────────────┐
   │  MY ORDERS PAGE         │
   │  /my-orders             │
   │  ─────────────────────  │
   │  📦 Order #ABC123       │
   │  Status: PREPARING      │
   │  Payment: PAID          │
   │  Total: ₹500           │
   │  [View Details]         │
   └──────────┬──────────────┘
              │
              │ Click View Details
              │
   ┌──────────▼──────────────┐
   │  ORDER DETAIL PAGE      │
   │  /order/:orderId        │
   │  ─────────────────────  │
   │  TIMELINE:              │
   │  ✅ Pending             │
   │  ✅ Confirmed           │
   │  ✅ Preparing           │
   │  ⏳ Out for Delivery    │
   │  ⭕ Delivered           │
   │                         │
   │  Order Items            │
   │  Payment Info           │
   │  Delivery Address       │
   └─────────────────────────┘

5. ADMIN MANAGEMENT
   ┌─────────────────────────┐
   │  Admin Dashboard        │
   │  /admin/orders          │
   │  ─────────────────────  │
   │                         │
   │  📦 Order #ABC123       │
   │  Customer: John Doe     │
   │  Payment: PAID          │
   │  Items: 3               │
   │  Total: ₹500           │
   │                         │
   │  Status: [Dropdown]     │
   │  ├─ Pending             │
   │  ├─ Confirmed           │
   │  ├─ Preparing      ✓    │
   │  ├─ Out for Delivery    │
   │  └─ Delivered           │
   └─────────────────────────┘
```

## Order Status Flow

```
PENDING (Order Created)
   │
   │ Payment Successful (Webhook)
   ▼
CONFIRMED (Payment Complete)
   │
   │ Admin Updates
   ▼
PREPARING (Kitchen Working)
   │
   │ Admin Updates
   ▼
OUT FOR DELIVERY (Driver Assigned)
   │
   │ Admin Updates
   ▼
DELIVERED (Order Complete) ✅
```

## Payment Status Flow

```
PENDING (Checkout Initiated)
   │
   ├──► COMPLETED (Payment Success) ✅
   │
   └──► FAILED (Payment Failed) ❌
```

## API Endpoints Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND APIs                              │
└─────────────────────────────────────────────────────────────────┘

Customer Endpoints:
  POST   /api/v1/order/checkout/create-checkout-session
         ├─ Creates order (PENDING)
         ├─ Creates Stripe session
         └─ Returns checkout URL

  GET    /api/v1/order/
         └─ Returns all user's orders

  GET    /api/v1/order/:orderId
         └─ Returns single order details

Admin Endpoints:
  GET    /api/v1/restaurant/order
         └─ Returns all restaurant orders

  PUT    /api/v1/restaurant/order/:orderId/status
         └─ Updates order status

Webhook:
  POST   /api/v1/order/webhook
         ├─ Receives Stripe events
         ├─ Verifies signature
         └─ Updates order on payment success
```

## Component Hierarchy

```
App.tsx
├─ MainLayout
│  ├─ Navbar
│  ├─ HeroSection
│  ├─ SearchPage
│  ├─ RestaurantDetail
│  ├─ Cart
│  │  └─ CheckoutConfirmPage (Dialog)
│  ├─ Success ← Payment Success
│  ├─ PaymentCancel ← Payment Cancel
│  ├─ MyOrders ← User Orders List
│  │  └─ [Order Cards] → OrderDetail
│  ├─ OrderDetail ← Single Order Tracking
│  └─ Profile
│     └─ [My Orders Button] → MyOrders
│
└─ Admin Routes
   ├─ Restaurant
   ├─ AddMenu
   └─ Orders ← Admin Order Management
```

## Data Flow

```
┌──────────┐    checkout    ┌──────────┐    webhook     ┌──────────┐
│          │ ─────────────> │          │ <───────────── │          │
│  Client  │                │  Server  │                │  Stripe  │
│          │ <───────────── │          │ ─────────────> │          │
└──────────┘   session.url  └──────────┘  create session└──────────┘
                                  │
                                  │ saves to
                                  ▼
                            ┌──────────┐
                            │ MongoDB  │
                            │ Orders   │
                            └──────────┘
```

## Security Flow

```
1. Authentication Check
   ├─ JWT Token in Cookie
   ├─ isAuthenticated Middleware
   └─ User ID from Token

2. Authorization Check
   ├─ User can only view own orders
   ├─ Admin can view all restaurant orders
   └─ Order ownership verified

3. Webhook Security
   ├─ Stripe Signature Verification
   ├─ Webhook Secret from .env
   └─ Request Origin Validation

4. Payment Security
   ├─ Amount verified server-side
   ├─ No client-side price manipulation
   └─ Stripe session metadata
```

---

**This diagram shows the complete flow from browsing to order completion!** 🎉
