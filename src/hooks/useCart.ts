// hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addToCartAPI,
  fetchCart,
  updateCartItemAPI,
  removeCartItemAPI,
} from "../services/cartServices";

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

  // Update cart item quantity mutation (PATCH)
  const { mutate: updateCartItem, isPending: isUpdatingCart } = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemAPI(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
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
  const cartCount = cartItems.reduce(
    (total: number, item: any) => total + item.quantity,
    0,
  );

  return {
    cartItems,
    cartCount,
    isLoading,
    addToCart,
    isAddingToCart,
    updateCartItem,
    isUpdatingCart,
    removeCartItem,
    isRemovingFromCart,
    refetchCart: refetch,
  };
};
