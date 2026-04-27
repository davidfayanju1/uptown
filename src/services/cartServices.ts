// services/cartServices.ts
import api from "../lib/axios";

export const fetchCart = async () => {
  const response = await api.get("/v1/cart");
  return response.data.data;
};

export const addToCartAPI = async (variantId: string, quantity: number = 1) => {
  const response = await api.post("/v1/cart/items", {
    variant_id: variantId,
    quantity,
  });
  return response.data;
};

export const updateCartItemAPI = async (itemId: string, quantity: number) => {
  const response = await api.patch(`/v1/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItemAPI = async (itemId: string) => {
  const response = await api.delete(`/v1/cart/items/${itemId}`);
  return response.data;
};
