import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PrimaryLayout from "../layout/PrimaryLayout";
import { BsTrash } from "react-icons/bs";
import { useCart } from "../hooks/useCart";

const Cart = () => {
  const navigate = useNavigate();
  const [deletingItemId, setDeletingItemId] = useState(null);
  const {
    cartItems,
    isLoading,
    error,
    refetchCart,
    updateCartItem,
    isUpdatingCart,
    removeCartItem,
    isRemovingFromCart,
  } = useCart();

  // Calculate totals - all in GBP
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.unit_price_snapshot_cents / 100) * item.quantity,
    0,
  );
  const shipping = 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Get product image (prefer variant_images, then product_images, then fallback)
  const getProductImage = (item) => {
    if (item.variant_images && item.variant_images.length > 0) {
      return item.variant_images[0];
    }
    if (item.product_images && item.product_images.length > 0) {
      return item.product_images[0];
    }
    return "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image";
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = async (itemId) => {
    setDeletingItemId(itemId);
    await removeCartItem({ itemId });
    setDeletingItemId(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <PrimaryLayout>
        <div className="min-h-screen mt-[5rem] bg-gray-50 py-8">
          <div className="container mx-auto md:px-4 px-2 max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </PrimaryLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PrimaryLayout>
        <div className="min-h-screen mt-[5rem] bg-gray-50 py-8">
          <div className="container mx-auto md:px-4 px-2 max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-4">Failed to load your cart</p>
              <button
                onClick={() => refetchCart()}
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PrimaryLayout>
    );
  }

  return (
    <PrimaryLayout>
      <style>
        {`
          .delete-btn:hover {
            background-color: #fee2e2;
            transform: scale(1.1);
          }
        `}
      </style>
      <div className="min-h-screen mt-[5rem] bg-gray-50 py-8">
        <div className="container mx-auto md:px-4 px-2 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600 mb-6">Your cart is empty</p>
              <Link
                to="/product"
                className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow-sm md:p-6 p-2">
                  <div className="hidden md:grid grid-cols-12 gap-4 text-gray-500 text-sm font-medium pb-4 border-b">
                    <div className="col-span-5">PRODUCT</div>
                    <div className="col-span-2">PRICE</div>
                    <div className="col-span-3">QUANTITY</div>
                    <div className="col-span-2">TOTAL</div>
                  </div>

                  {cartItems.map((item) => {
                    const itemPrice = item.unit_price_snapshot_cents / 100;
                    const itemTotal = itemPrice * item.quantity;
                    const productImage = getProductImage(item);
                    const isMutating = isUpdatingCart || isRemovingFromCart;
                    const isCurrentItemDeleting = deletingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b-[1px] border-gray-200 items-center"
                      >
                        {/* Product Info */}
                        <div className="md:col-span-5 flex items-start">
                          <div className="h-28 w-28 md:h-20 md:w-20 flex-shrink-0 overflow-hidden bg-gray-200 mr-4 flex items-center justify-center">
                            <img
                              src={productImage}
                              alt={item.product_title || "Product"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col md:h-full h-[6rem] md:justify-center justify-between">
                            <div className="item-container">
                              <h3 className="md:text-sm text-[10px] line-clamp-2 md:font-bold text-gray-900">
                                {item.product_title || "Product Item"}
                              </h3>
                              <p className="mt-1 text-xs text-gray-500">
                                {item.color || "Default"} |{" "}
                                {item.size || "One Size"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                SKU: {item.sku}
                              </p>
                            </div>
                          </div>

                          {/* Mobile view controls */}
                          <div className="md:hidden h-full">
                            <div className="flex h-[6rem] justify-between flex-col">
                              <div className="text-sm text-right font-medium text-gray-900">
                                £{itemPrice.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center rounded-md">
                                  <button
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        item.id,
                                        item.quantity - 1,
                                      )
                                    }
                                    disabled={isMutating}
                                    className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                                  >
                                    −
                                  </button>
                                  <span className="px-1 py-1">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        item.id,
                                        item.quantity + 1,
                                      )
                                    }
                                    disabled={isMutating}
                                    className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={isMutating}
                                  className="delete-btn transition-all duration-200 rounded-full p-1 flex items-center justify-center w-8 h-8 disabled:opacity-50"
                                >
                                  {isCurrentItemDeleting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                                  ) : (
                                    <BsTrash color="red" size={16} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop: Price */}
                        <div className="hidden md:block md:col-span-2 text-sm text-gray-900 font-medium">
                          £{itemPrice.toFixed(2)}
                        </div>

                        {/* Desktop: Quantity Controls */}
                        <div className="hidden md:flex md:col-span-3 items-center">
                          <div className="flex items-center border">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={isMutating}
                              className="px-3 py-1 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 border-l border-r">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={isMutating}
                              className="px-3 cursor-pointer py-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isMutating}
                            className="delete-btn ml-4 transition-all duration-200 rounded-full p-2 flex items-center justify-center disabled:opacity-50"
                          >
                            {isCurrentItemDeleting ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                            ) : (
                              <BsTrash color="red" size={18} />
                            )}
                          </button>
                        </div>

                        {/* Desktop: Total */}
                        <div className="hidden md:block md:col-span-2 text-sm font-bold text-gray-900">
                          £{itemTotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-2 border-b pb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        £{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        £{shipping.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">£{tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4 mb-6">
                    <span className="text-lg font-medium text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      £{total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-3 px-4 font-medium hover:from-gray-800 hover:to-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Checkout · £{total.toFixed(2)}
                  </button>

                  <div className="mt-4 text-center text-sm text-gray-500">
                    or{" "}
                    <Link
                      to="/product"
                      className="text-gray-900 hover:underline"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default Cart;
