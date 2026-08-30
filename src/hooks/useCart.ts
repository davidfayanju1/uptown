// hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addToCartAPI,
  fetchCart,
  updateCartItemAPI,
  removeCartItemAPI,
} from "../services/cartServices";

type CartItem = { id: string; quantity: number; [key: string]: any };
type CartData = { items?: CartItem[]; [key: string]: any };

const CART_KEY = ["cart"];
const UPDATE_ITEM_KEY = ["cart", "updateItem"];

// Turn an API failure into something worth showing the shopper
const getCartErrorMessage = (error: any) => {
  const message = String(
    error?.response?.data?.message || error?.response?.data?.error || "",
  );
  if (message.includes("insufficient_stock")) {
    return "Not enough stock available for this item.";
  }
  return message || "Couldn't update your cart. Please try again.";
};

export const useCart = () => {
  const queryClient = useQueryClient();

  // Get cart data
  const {
    data: cartData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  // Add to cart mutation
  const { mutate: addToCart, isPending: isAddingToCart } = useMutation({
    mutationFn: ({
      variantId,
      quantity,
    }: {
      variantId: string;
      quantity: number;
    }) => addToCartAPI(variantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Update cart item quantity mutation (PATCH) — applied optimistically so the
  // stepper responds on click, with the pre-request cart kept for rollback.
  const {
    mutate: updateCartItem,
    isPending: isUpdatingCart,
    error: updateCartError,
  } = useMutation({
    mutationKey: UPDATE_ITEM_KEY,
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemAPI(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      // Stop an in-flight refetch from clobbering the optimistic value
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previousCart = queryClient.getQueryData<CartData>(CART_KEY);

      queryClient.setQueryData<CartData>(CART_KEY, (current) =>
        current?.items
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item,
              ),
            }
          : current,
      );

      return { previousCart };
    },
    // Any failure — out of stock, network, anything — puts the old quantity back
    onError: (error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_KEY, context.previousCart);
      }
      toast.error(getCartErrorMessage(error));
    },
    // Reconcile with the server, but only once the last queued change lands,
    // so a burst of clicks doesn't trigger a refetch per click
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: UPDATE_ITEM_KEY }) === 1) {
        queryClient.invalidateQueries({ queryKey: CART_KEY });
      }
    },
  });

  // Remove cart item mutation
  const { mutate: removeCartItem, isPending: isRemovingFromCart } = useMutation(
    {
      mutationFn: ({ itemId }: { itemId: string }) => removeCartItemAPI(itemId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    },
  );

  const cartItems = cartData?.items || [];
  // The coupon is stored on the cart, so it outlives a page reload
  const cartCoupon = cartData?.cart?.coupon_code || cartData?.coupon_code || null;
  const cartCount = cartItems.reduce(
    (total: number, item: any) => total + item.quantity,
    0,
  );

  // console.log(cartItems, "Cart data from useCart hook");

  return {
    cartItems,
    cartCoupon,
    cartCount,
    isLoading,
    addToCart,
    isAddingToCart,
    updateCartItem,
    isUpdatingCart,
    removeCartItem,
    isRemovingFromCart,
    refetchCart: refetch,
    updateCartError,
  };
};
