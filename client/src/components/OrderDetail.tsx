import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "@/store/useOrderStore";
import { Orders } from "@/types/orderType";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck,
  MapPin,
  IndianRupee,
  Mail,
  User
} from "lucide-react";
import Loading from "./Loading";

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, loading } = useOrderStore();
  const [order, setOrder] = useState<Orders | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const fetchedOrder = await getOrderById(orderId);
        setOrder(fetchedOrder);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-300 mb-4">
            Order not found!
          </h1>
          <Button onClick={() => navigate('/')} className="bg-orange hover:bg-hoverOrange">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      outfordelivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'outfordelivery':
        return <Truck className="w-5 h-5" />;
      case 'preparing':
        return <Clock className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // Order status timeline
  const statusSteps = [
    { status: 'pending', label: 'Order Placed' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'preparing', label: 'Preparing' },
    { status: 'outfordelivery', label: 'Out for Delivery' },
    { status: 'delivered', label: 'Delivered' }
  ];

  const currentStatusIndex = statusSteps.findIndex(
    step => step.status === order.status.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Order Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Order ID: #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Order Status */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(order.status)}
              <p className="text-sm text-gray-600 dark:text-gray-400">Order Status</p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.toUpperCase().replace('OUTFORDELIVERY', 'OUT FOR DELIVERY')}
            </Badge>
          </div>

          {/* Payment Status */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
            </div>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              {order.paymentStatus.toUpperCase()}
            </Badge>
          </div>

          {/* Total Amount */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              ₹{order.totalAmount / 100}
            </p>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Order Timeline
          </h2>
          <div className="relative">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex items-center mb-4 last:mb-0">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStatusIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {index <= currentStatusIndex ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <div className="w-2 h-2 bg-current rounded-full" />
                  )}
                </div>
                <div className="ml-4">
                  <p className={`font-medium ${
                    index <= currentStatusIndex
                      ? 'text-gray-800 dark:text-gray-200'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`absolute left-4 w-0.5 h-8 ${
                    index < currentStatusIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} style={{ top: `${(index + 1) * 3}rem` }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Order Items
          </h2>
          {order.cartItems.map((item, index: number) => (
            <div key={index}>
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
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    ₹{Number(item.price) * Number(item.quantity)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{item.price} each
                  </p>
                </div>
              </div>
              {index < order.cartItems.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Delivery Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Delivery Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {order.deliveryDetails.name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {order.deliveryDetails.email}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {order.deliveryDetails.address}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.deliveryDetails.city}, {order.deliveryDetails.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
