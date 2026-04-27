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
