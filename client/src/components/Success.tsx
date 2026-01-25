import { IndianRupee, CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { Separator } from "./ui/separator";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { useOrderStore } from "@/store/useOrderStore";
import { useEffect, useState } from "react"; 
import { Badge } from "./ui/badge";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Success = () => {
  const { orders, getOrderDetails } = useOrderStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get session ID from URL query params (Stripe adds session_id)
        const sessionId = searchParams.get('session_id');
        
        console.log('🔍 Checking for session_id in URL:', sessionId);
        
        if (!sessionId) {
          console.warn('⚠️  No session ID found in URL - user may have navigated directly');
          setError('Invalid payment session. Please try checking out again.');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Verifying payment for session:', sessionId);
        
        // Call server to verify and create order
        const verifyResponse = await axios.post(`${API_BASE}/api/payment/verify-order`, {
          sessionId
        }, {
          withCredentials: true
        });
        
        console.log('✅ Payment verified:', verifyResponse.data);
        
        // Add a small delay to ensure database is synced
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch updated orders
        console.log('📋 Fetching order details...');
        await getOrderDetails();
        console.log('✅ Orders fetched successfully');
        setIsLoading(false);
        
        // Auto-redirect to Orders overview after showing success
        const timer = setTimeout(() => {
          navigate('/my-orders');
        }, 3000);
        
        return () => clearTimeout(timer);
      } catch (error: any) {
        console.error('❌ Error verifying payment:', error);
        const errorMsg = error?.response?.data?.message || error?.message || 'Failed to verify payment';
        setError(errorMsg);
        setIsLoading(false);
        
        // Still try to fetch orders in case they were created
        try {
          await getOrderDetails();
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        }
      }
    };

    verifyPayment();
  }, [searchParams, getOrderDetails, navigate]);

  // Get the most recent order (assuming it's the one just completed)
  const latestOrder = orders.length > 0 ? orders[0] : null;

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-300 mb-2">
            Processing your payment...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your order.
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="font-bold text-2xl text-red-600 dark:text-red-400 mb-4">
            Payment Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Link to="/">
            <Button className="bg-orange hover:bg-hoverOrange">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-300 mb-4">
            Order not found!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            It looks like you haven't placed any orders yet.
          </p>
          <Link to="/">
            <Button className="bg-orange hover:bg-hoverOrange">
              Browse Restaurants
            </Button>
          </Link>
        </div>
      </div>
    );

  // Helper to get status badge color
  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      outfordelivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
    };
    const key = (status ?? "").toLowerCase();
    return colors[key] || "bg-gray-100 text-gray-800";
  };

  // Helper to get payment status badge
  const getPaymentStatusBadge = (status?: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    const key = (status ?? "").toLowerCase();
    return colors[key] || "bg-gray-100 text-gray-800";
  };

  // Calculate estimated delivery time (e.g., 30-45 minutes from order time)
  const getEstimatedDelivery = () => {
    if (latestOrder?.createdAt) {
      const orderTime = new Date(latestOrder.createdAt);
      const deliveryTime = new Date(orderTime.getTime() + 45 * 60000); // Add 45 minutes
      return deliveryTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return "30-45 minutes";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-2xl w-full">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your order. Your food is being prepared.
          </p>
        </div>

        {latestOrder && (
          <>
            {/* Order Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Order ID */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  #{latestOrder._id ? latestOrder._id.slice(-8).toUpperCase() : "ORDER"}
                </p>
              </div>

              {/* Payment Status */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payment</p>
                </div>
                <Badge className={getPaymentStatusBadge(latestOrder.paymentStatus)}>
                  {latestOrder.paymentStatus === "completed"
                    ? "PAID"
                    : (latestOrder.paymentStatus ?? "pending").toUpperCase()}
                </Badge>
              </div>

              {/* Delivery Time */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Est. Delivery</p>
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {getEstimatedDelivery()}
                </p>
              </div>
            </div>

            {/* Order Status */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Order Status:
                  </span>
                </div>
                <Badge className={getStatusColor(latestOrder.status)}>
                  {(latestOrder.status ?? "pending")
                    .toUpperCase()
                    .replace("OUTFORDELIVERY", "OUT FOR DELIVERY")}
                </Badge>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Order Summary
              </h2>
              {latestOrder.cartItems.map((item, idx: number) => (
                <div key={item.menuId ?? idx}>
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-800 dark:text-gray-200 flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        <span className="text-lg font-medium">{Number(item.price) * Number(item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                  {idx < latestOrder.cartItems.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Total Amount
                </span>
                <div className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                  <IndianRupee className="w-6 h-6" />
                  <span>{latestOrder.totalAmount / 100}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Delivery Address
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{latestOrder.deliveryDetails.name}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {latestOrder.deliveryDetails.address}, {latestOrder.deliveryDetails.city}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {latestOrder.deliveryDetails.email}
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Browse More Restaurants
            </Button>
          </Link>
          <Button
            onClick={() => navigate('/my-orders')}
            className="flex-1 bg-orange hover:bg-hoverOrange"
          >
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success;
