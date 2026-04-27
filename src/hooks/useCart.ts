// hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCartAPI, fetchCart } from "../services/cartServices";

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
      // Refetch cart after successful add
      refetch();
    },
  });

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
    refetchCart: refetch,
  };
};
