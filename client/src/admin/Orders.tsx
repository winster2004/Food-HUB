import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useEffect } from "react";
import { IndianRupee, Package } from "lucide-react";

const Orders = () => {
  const { restaurantOrder, getRestaurantOrders, updateRestaurantOrder } =
    useRestaurantStore();

  const handleStatusChange = async (id: string, status: string) => {
    await updateRestaurantOrder(id, status);
  };

  useEffect(() => {
    getRestaurantOrders(); 
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
        Orders Overview
      </h1>
      
      {restaurantOrder.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Package className="w-20 h-20 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No Orders Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Orders will appear here when customers place them
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Restaurant Orders display here  */}
          {restaurantOrder.map((order: any) => (
            <div 
              key={order._id}
              className="flex flex-col md:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1 mb-6 sm:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {order.deliveryDetails.name}
                  </h2>
                  <Badge className={getPaymentStatusColor(order.paymentStatus || 'pending')}>
                    {order.paymentStatus === 'completed' ? 'PAID' : (order.paymentStatus || 'pending').toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-semibold">Order ID: </span>
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-semibold">Address: </span>
                  {order.deliveryDetails.address}, {order.deliveryDetails.city}
                </p>
                
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-semibold">Email: </span>
                  {order.deliveryDetails.email}
                </p>
                
                <div className="flex items-center text-gray-800 dark:text-gray-200 mt-3">
                  <span className="font-semibold mr-2">Total Amount: </span>
                  <div className="flex items-center font-bold text-lg">
                    <IndianRupee className="w-4 h-4" />
                    <span>{order.totalAmount / 100}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  <span className="font-semibold">Order Date: </span>
                  {formatDate(order.createdAt)}
                </p>

                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Items ({order.cartItems?.length || 0}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.cartItems?.slice(0, 3).map((item: any, idx: number) => (
                      <img
                        key={idx}
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-gray-700"
                        title={item.name}
                      />
                    ))}
                    {order.cartItems?.length > 3 && (
                      <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                        +{order.cartItems.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-1/3">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Status
                </Label>
                <Select
                  onValueChange={(newStatus) =>
                    handleStatusChange(order._id, newStatus)
                  }
                  defaultValue={order.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[
                        "Pending",
                        "Confirmed",
                        "Preparing",
                        "OutForDelivery",
                        "Delivered",
                      ].map((status: string, index: number) => (
                        <SelectItem key={index} value={status.toLowerCase()}>
                          {status.replace('OutForDelivery', 'Out for Delivery')}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
