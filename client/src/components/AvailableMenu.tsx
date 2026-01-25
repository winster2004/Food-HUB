import { MenuItem } from "@/types/restaurantType";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useCartStore } from "@/store/useCartStore";
import { useNavigate } from "react-router-dom";

const AvailableMenu = ({ menus }: { menus: MenuItem[] }) => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  
  return (
    <div className="md:p-4">
      <h1 className="text-xl md:text-2xl font-extrabold mb-6">
        Available Menus
      </h1>
      
      {!menus || menus.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Menu Items Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This restaurant hasn't added any menu items yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 space-y-4 md:space-y-0">
          {menus.map((menu: MenuItem) => (
            <Card key={menu._id} className="max-w-xs mx-auto shadow-lg rounded-lg overflow-hidden">
              <img src={menu.image} alt="" className="w-full h-40 object-cover" />
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {menu.name}
                </h2>
                <p className="text-sm text-gray-600 mt-2">{menu.description}</p>
                <h3 className="text-lg font-semibold mt-4">
                  Price: <span className="text-[#D19254]">₹{menu.price}</span>
                </h3>
              </CardContent>
              <CardFooter className="p-4">
                <Button
                  onClick={() => {
                    addToCart(menu);
                    navigate("/cart");
                  }}
                  className="w-full bg-orange hover:bg-hoverOrange"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableMenu;
