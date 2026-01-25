import { Dispatch, FormEvent, SetStateAction, useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUserStore } from "@/store/useUserStore";
import { CheckoutSessionRequest } from "@/types/orderType";
import { useCartStore } from "@/store/useCartStore";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Loader2 } from "lucide-react";

const CheckoutConfirmPage = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user } = useUserStore();
  const [input, setInput] = useState({
    name: user?.fullname || "",
    email: user?.email || "",
    contact: user?.contact.toString() || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
  });
  const { cart } = useCartStore();
  const { restaurant } = useRestaurantStore();
  const { createCheckoutSession } = useOrderStore();
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset local loading state when checkout completes or times out
  useEffect(() => {
    if (!localLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [localLoading]);

  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const checkoutHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLocalLoading(true);

    if (!restaurant?._id) {
      setError("Restaurant not found. Please reopen the cart.");
      setLocalLoading(false);
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      setLocalLoading(false);
      return;
    }

    // Set a timeout to reset loading after 40 seconds
    timeoutRef.current = setTimeout(() => {
      console.error('❌ Checkout request timed out after 40 seconds');
      setError('Payment request timed out. Please try again.');
      setLocalLoading(false);
    }, 40000);

    try {
      const checkoutData: CheckoutSessionRequest = {
        cartItems: cart.map((cartItem) => ({
          menuId: cartItem._id,
          name: cartItem.name,
          image: cartItem.image,
          price: Number(cartItem.price),
          quantity: Number(cartItem.quantity),
        })),
        deliveryDetails: input,
        restaurantId: restaurant._id,
      };

      console.log('📤 Starting checkout...');
      console.log('🛒 Cart items:', cart.length);
      console.log('🏪 Restaurant ID:', restaurant._id);
      const response = await createCheckoutSession(checkoutData);
      console.log('✅ Checkout response:', response);
      // If we get here, we're redirecting to Stripe
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } catch (err: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const errorMsg = err?.message || "Unable to start payment. Please try again.";
      setError(errorMsg);
      setLocalLoading(false);
      console.error('❌ Checkout error:', err);
      console.error('Error message:', errorMsg);
      console.error('Full error:', JSON.stringify(err, null, 2));
      // Show alert so user doesn't miss the error
      alert('⚠️ Checkout Error:\n\n' + errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle className="font-semibold">Review Your Order</DialogTitle>
        <DialogDescription className="text-xs">
          Double-check your delivery details and ensure everything is in order.
          When you are ready, hit confirm button to finalize your order
        </DialogDescription>
        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}
        <form
          onSubmit={checkoutHandler}
          className="md:grid grid-cols-2 gap-2 space-y-1 md:space-y-0"
        >
          <div>
            <Label>Fullname</Label>
            <Input
              type="text"
              name="name"
              value={input.name}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              disabled
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label>Contact</Label>
            <Input
              type="text"
              name="contact"
              value={input.contact}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              type="text"
              name="address"
              value={input.address}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              type="text"
              name="city"
              value={input.city}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              type="text"
              name="country"
              value={input.country}
              onChange={changeEventHandler}
            />
          </div>
          <DialogFooter className="col-span-2 pt-5">
            {localLoading ? (
              <Button disabled className="bg-orange hover:bg-hoverOrange">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button className="bg-orange hover:bg-hoverOrange" disabled={localLoading}>
                Continue To Payment
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutConfirmPage;
