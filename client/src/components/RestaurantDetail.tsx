import { useRestaurantStore } from "@/store/useRestaurantStore";
import AvailableMenu from "./AvailableMenu";
import { Badge } from "./ui/badge";
import { Timer } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

// Helper function to clean up malformed cuisine strings
const cleanCuisine = (cuisine: string): string => {
  try {
    // If it looks like JSON, try to parse and clean it
    if (typeof cuisine === 'string' && (cuisine.startsWith('[') || cuisine.startsWith('"'))) {
      let cleaned = cuisine;
      // Remove extra quotes and brackets
      while (cleaned.startsWith('[') || cleaned.startsWith('"')) {
        cleaned = cleaned.slice(1);
      }
      while (cleaned.endsWith(']') || cleaned.endsWith('"')) {
        cleaned = cleaned.slice(0, -1);
      }
      // Remove escape characters
      cleaned = cleaned.replace(/\\/g, '');
      return cleaned.trim();
    }
    return cuisine;
  } catch {
    return cuisine;
  }
};

const RestaurantDetail = () => {
  const params = useParams();
  const { singleRestaurant, getSingleRestaurant, setRestaurant } = useRestaurantStore();

  useEffect(() => {
    const loadRestaurant = async () => {
      const restaurantData = await getSingleRestaurant(params.id!);
      // Set the restaurant in store for checkout
      if (restaurantData) {
        setRestaurant(restaurantData);
      }
    };
    loadRestaurant();
  }, [params.id, getSingleRestaurant, setRestaurant]);

  return (
    <div className="max-w-6xl mx-auto my-10">
      <div className="w-full">
        <div className="relative w-full h-32 md:h-64 lg:h-72">
          <img
            src={singleRestaurant?.imageUrl || "Loading..."}
            alt="res_image"
            className="object-cover w-full h-full rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between">
          <div className="my-5">
            <h1 className="font-medium text-xl">{singleRestaurant?.restaurantName || "Loading..."}</h1>
            <div className="flex gap-2 my-2">
              {singleRestaurant?.cuisines.map((cuisine: string, idx: number) => (
                <Badge key={idx}>{cleanCuisine(cuisine)}</Badge>
              ))}
            </div>
            <div className="flex md:flex-row flex-col gap-2 my-5">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <h1 className="flex items-center gap-2 font-medium">
                  Delivery Time: <span className="text-[#D19254]">{singleRestaurant?.deliveryTime || "NA"} mins</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
       {singleRestaurant?.menus && <AvailableMenu menus = {singleRestaurant?.menus!}/>} 
      </div>
    </div>
  );
};

export default RestaurantDetail;
