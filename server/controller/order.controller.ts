import { Request, Response } from "express";
import { Restaurant, IRestaurantDocument } from "../models/restaurant.model";
import { Order } from "../models/order.model";
import { stripe, STRIPE_CONFIG } from "../utils/stripe";
import Stripe from "stripe";

type CheckoutSessionRequest = {
    cartItems: {
        menuId: string;
        name: string;
        image: string;
        price: number;
        quantity: number
    }[],
    deliveryDetails: {
        name: string;
        email: string;
        address: string;
        city: string
    },
    restaurantId: string
}

export const verifyAndCreateOrder = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;
        
        console.log('🔍 Verify order request - Session ID:', sessionId);
        console.log('👤 Authenticated user ID:', req.id);
        
        if (!sessionId) {
            console.error('❌ No session ID provided');
            return res.status(400).json({
                success: false,
                message: "Session ID is required"
            });
        }

        // Retrieve the session from Stripe
        console.log('📡 Retrieving Stripe session...');
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        console.log('✅ Session retrieved:', session.id, 'Payment Status:', session.payment_status);

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            console.error('❌ Payment not completed. Status:', session.payment_status);
            return res.status(400).json({
                success: false,
                message: "Payment not completed"
            });
        }

        // Extract metadata
        const userId = session.metadata?.userId as string | undefined;
        const restaurantId = session.metadata?.restaurantId as string | undefined;
        const deliveryDetailsRaw = session.metadata?.deliveryDetails as string | undefined;
        const cartItemsRaw = session.metadata?.cartItems as string | undefined;

        console.log('📋 Extracted metadata - UserId:', userId, 'RestaurantId:', restaurantId);

        if (!userId || !restaurantId || !deliveryDetailsRaw || !cartItemsRaw) {
            console.error('❌ Missing metadata - UserId:', userId, 'RestaurantId:', restaurantId, 'DeliveryDetails:', !!deliveryDetailsRaw, 'CartItems:', !!cartItemsRaw);
            return res.status(400).json({
                success: false,
                message: "Missing order data"
            });
        }

        // Check if order already exists for this session
        console.log('🔎 Checking for existing order...');
        const existingOrder = await Order.findOne({ stripeSessionId: session.id });
        if (existingOrder) {
            console.log('✅ Order already exists:', existingOrder._id);
            return res.status(200).json({
                success: true,
                message: "Order already created",
                order: existingOrder
            });
        }

        const deliveryDetails = JSON.parse(deliveryDetailsRaw);
        const cartItems = JSON.parse(cartItemsRaw);

        console.log('💾 Creating new order...');
        const order = new Order({
            user: userId,
            restaurant: restaurantId,
            deliveryDetails,
            cartItems,
            totalAmount: session.amount_total ?? 0,
            status: "pending",
            paymentStatus: "completed",
            stripeSessionId: session.id,
        });

        await order.save();
        console.log(`✅ Order created successfully: ${order._id}`);

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            order
        });
    } catch (error: any) {
        console.error('❌ Verify order error:', error.message);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        console.log('📦 Fetching orders for user:', req.id);
        const orders = await Order.find({ user: req.id }).sort({ createdAt: -1 }).populate('user').populate('restaurant');
        console.log('✅ Orders found:', orders.length);
        console.log('Order IDs:', orders.map(o => o._id));
        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('❌ Get orders error:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate('user')
            .populate('restaurant');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Ensure the order belongs to the requesting user (security check)
        if ((order.user as any)._id.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to view this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        console.log('=== Checkout Session Request ===');
        console.log('User ID:', req.id);
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        
        // Check if user is authenticated
        if (!req.id) {
            console.error('User not authenticated - no req.id');
            return res.status(401).json({
                success: false,
                message: "User must be logged in to checkout"
            });
        }
        
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;
        
        // Validate input
        if (!checkoutSessionRequest.restaurantId) {
            console.error('Missing restaurantId');
            return res.status(400).json({
                success: false,
                message: "Restaurant ID is required."
            });
        }
        if (!checkoutSessionRequest.cartItems || checkoutSessionRequest.cartItems.length === 0) {
            console.error('Empty cartItems');
            return res.status(400).json({
                success: false,
                message: "Cart items are required."
            });
        }

        const restaurantData: any = await Restaurant.findById(checkoutSessionRequest.restaurantId).populate('menus');
        if (!restaurantData) {
            console.error('Restaurant not found:', checkoutSessionRequest.restaurantId);
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            })
        }
        const restaurant = restaurantData as unknown as IRestaurantDocument;

        // Build Stripe line items using authoritative restaurant menu data
        const menuItems = restaurant.menus;
        console.log(`🍽️ Restaurant: ${restaurant.restaurantName}, Menu items count: ${menuItems?.length || 0}`);
        if (!menuItems || menuItems.length === 0) {
            console.error('No menu items found for restaurant:', restaurant._id);
            return res.status(400).json({
                success: false,
                message: "Restaurant has no menu items."
            });
        }

        try {
            var lineItems = createLineItems(checkoutSessionRequest, menuItems);
            console.log('Created line items:', lineItems.length);
        } catch (error: any) {
            console.error('Line items creation error:', error.message);
            return res.status(400).json({
                success: false,
                message: `Invalid menu item: ${error.message}`
            });
        }

        // Create Stripe Checkout Session; do NOT create Order yet
        const session = await stripe.checkout.sessions.create({
            shipping_address_collection: {
                allowed_countries: STRIPE_CONFIG.ALLOWED_COUNTRIES
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: STRIPE_CONFIG.getSuccessUrl(),
            cancel_url: STRIPE_CONFIG.getCancelUrl(),
            metadata: {
                // Persist data needed to create order after payment success
                userId: req.id!,
                restaurantId: restaurantData._id.toString(),
                deliveryDetails: JSON.stringify(checkoutSessionRequest.deliveryDetails),
                cartItems: JSON.stringify(checkoutSessionRequest.cartItems),
                images: JSON.stringify(menuItems.map((item: any) => item.image)),
            }
        });

        console.log('✅ Stripe session created:', session.id);
        console.log('🔗 Session URL:', session.url);

        if (!session.url) {
            console.error('No session URL returned from Stripe');
            return res.status(400).json({ success: false, message: "Error while creating session" });
        }

        // Return only the essential session data
        return res.status(200).json({ 
            session: {
                id: session.id,
                url: session.url,
                payment_status: session.payment_status
            }
        });
    } catch (error: any) {
        console.error('Checkout session error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({ 
            success: false, 
            message: error?.message || "Internal server error" 
        })
    }
}

export const stripeWebhook = async (req: Request, res: Response) => {
    let event;

    try {
        const signature = req.headers["stripe-signature"];
        const payloadString = JSON.stringify(req.body, null, 2);
        const secret = process.env.WEBHOOK_ENDPOINT_SECRET!;

        // For development/testing: construct event using test header
        if (!signature) {
            const header = stripe.webhooks.generateTestHeaderString({
                payload: payloadString,
                secret,
            });
            event = stripe.webhooks.constructEvent(payloadString, header, secret);
        } else {
            // For production: verify actual webhook signature
            event = stripe.webhooks.constructEvent(req.body, signature, secret);
        }
    } catch (error: any) {
        console.error('Webhook error:', error.message);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    // Handle the checkout session completed event
    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object as Stripe.Checkout.Session;

            // Create order only after successful payment
            const userId = session.metadata?.userId as string | undefined;
            const restaurantId = session.metadata?.restaurantId as string | undefined;
            const deliveryDetailsRaw = session.metadata?.deliveryDetails as string | undefined;
            const cartItemsRaw = session.metadata?.cartItems as string | undefined;

            if (!userId || !restaurantId || !deliveryDetailsRaw || !cartItemsRaw) {
                console.error('Missing metadata for order creation');
                return res.status(200).send();
            }

            const deliveryDetails = JSON.parse(deliveryDetailsRaw);
            const cartItems = JSON.parse(cartItemsRaw);

            const order = new Order({
                user: userId,
                restaurant: restaurantId,
                deliveryDetails,
                cartItems,
                totalAmount: session.amount_total ?? 0,
                status: "pending", // initial status after payment
                paymentStatus: "completed",
                stripeSessionId: session.id,
            });

            await order.save();
            console.log(`✅ Payment successful. Created order: ${order._id}`);
        } catch (error) {
            console.error('Error handling event:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    
    // Handle payment failed events
    if (event.type === "checkout.session.async_payment_failed") {
        try {
            const session = event.data.object as Stripe.Checkout.Session;
            const order = await Order.findById(session.metadata?.orderId);

            if (order) {
                order.paymentStatus = "failed";
                await order.save();
                console.log(`❌ Payment failed for order: ${order._id}`);
            }
        } catch (error) {
            console.error('Error handling payment failure:', error);
        }
    }
    
    // Send a 200 response to acknowledge receipt of the event
    res.status(200).send();
};

export const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: any) => {
    // 1. create line items
    const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
        console.log(`🔍 Looking for menu item: ${cartItem.menuId}`);
        console.log(`Available menu items:`, menuItems.map((m: any) => ({ id: m._id?.toString(), name: m.name })));
        
        const menuItem = menuItems.find((item: any) => {
            const itemId = item._id?.toString() || item._id;
            return itemId === cartItem.menuId;
        });
        
        if (!menuItem) {
            console.error(`❌ Menu item not found for ID: ${cartItem.menuId}`);
            throw new Error(`Menu item id not found: ${cartItem.menuId}`);
        }

        console.log(`✅ Found menu item: ${menuItem.name}`);

        return {
            price_data: {
                currency: STRIPE_CONFIG.CURRENCY, // Indian Rupee (change to 'usd' for US Dollar)
                product_data: {
                    name: menuItem.name,
                    images: [menuItem.image],
                },
                unit_amount: menuItem.price * 100 // Stripe expects amount in smallest currency unit (paise for INR)
            },
            quantity: Number(cartItem.quantity),
        }
    })
    // 2. return lineItems
    return lineItems;
}