import { useEffect } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Package, 
  IndianRupee, 
  Clock,
  Eye,
  ShoppingBag
} from "lucide-react";
import { Orders as OrderType } from "@/types/orderType";
import Loading from "./Loading";

const MyOrders = () => {
  const { orders, getOrderDetails, loading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    getOrderDetails();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      outfordelivery: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          My Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage your food orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <ShoppingBag className="w-20 h-20 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No Orders Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            You haven't placed any orders yet. Start exploring restaurants and place your first order!
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-orange hover:bg-hoverOrange"
          >
            Browse Restaurants
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: OrderType) => (
            <div 
              key={order._id}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange/10 p-3 rounded-lg">
                    <Package className="w-6 h-6 text-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase().replace('OUTFORDELIVERY', 'OUT FOR DELIVERY')}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus === 'completed' ? 'PAID' : order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Items ({order.cartItems.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.cartItems.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-md object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ))}
                  {order.cartItems.length > 3 && (
                    <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      +{order.cartItems.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <div className="flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
                    <IndianRupee className="w-5 h-5" />
                    <span>{order.totalAmount / 100}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="bg-orange hover:bg-hoverOrange w-full sm:w-auto"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
