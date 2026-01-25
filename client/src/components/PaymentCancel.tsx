import { XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const PaymentCancel = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        {/* Failed Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900 rounded-full p-4">
            <XCircle className="w-20 h-20 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          Payment Cancelled
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Your payment was not completed. No charges have been made to your account.
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          If you encountered any issues, please try again or contact support.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link to="/cart">
            <Button className="w-full bg-orange hover:bg-hoverOrange">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Return to Cart
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="w-full">
              Browse Restaurants
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{" "}
            <a 
              href="mailto:support@foodhub.com" 
              className="text-orange hover:underline font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
