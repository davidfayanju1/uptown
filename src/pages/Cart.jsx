import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PrimaryLayout from "../layout/PrimaryLayout";
import { IoCloseOutline } from "react-icons/io5";
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

  // Dynamic currency contextual mapper
  const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode?.toUpperCase()) {
      case "GBP":
        return "£";
      case "USD":
        return "$";
      case "NGN":
        return "₦";
      default:
        return "£";
    }
  };

  const activeCurrencySymbol =
    cartItems.length > 0 ? getCurrencySymbol(cartItems[0].currency) : "£";

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.unit_price_snapshot_cents / 100) * item.quantity,
    0,
  );
  const total = subtotal;

  const getProductImage = (item) => {
    if (item.variant_images && item.variant_images.length > 0) {
      return item.variant_images[0];
    }
    if (item.product_images && item.product_images.length > 0) {
      return item.product_images[0];
    }
    return "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image";
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;

    const maxAvailableStock = item.max_stock || 10;
    if (newQuantity > maxAvailableStock) {
      alert(
        `Maximum available stock limit (${maxAvailableStock}) reached for this item.`,
      );
      return;
    }

    updateCartItem({ itemId: item.id, quantity: newQuantity });
  };

  const handleRemoveItem = async (itemId) => {
    setDeletingItemId(itemId);
    await removeCartItem({ itemId });
    setDeletingItemId(null);
  };

  // =========================================================
  // REACT DATA TABLE CONFIGURATION & STYLING
  // =========================================================
  const columns = [
    {
      name: "PRODUCT",
      grow: 5,
      cell: (row) => {
        const productImage = getProductImage(row);
        return (
          <div className="flex items-start py-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-gray-200 mr-4 flex items-center justify-center">
              <img
                src={productImage}
                alt={row.product_title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col h-full justify-center">
              <Link to={`/product/${row?.product_id}`}>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                  {row.product_title || "Product Item"}
                </h3>
              </Link>
              <p className="mt-1 text-xs text-gray-500">
                {row.color || "Default"} | {row.size || "One Size"}
              </p>
              <p className="mt-1 text-xs text-gray-400">SKU: {row.sku}</p>
            </div>
          </div>
        );
      },
    },
    {
      name: "PRICE",
      grow: 2,
      cell: (row) => (
        <div className="text-sm text-gray-900 font-medium">
          {getCurrencySymbol(row.currency)}
          {(row.unit_price_snapshot_cents / 100).toFixed(2)}
        </div>
      ),
    },
    {
      name: "QUANTITY",
      grow: 3,
      cell: (row) => {
        const isMutating = isUpdatingCart || isRemovingFromCart;
        const isCurrentItemDeleting = deletingItemId === row.id;
        return (
          <div className="flex items-center">
            <div className="flex items-center border border-gray-200 bg-white">
              <button
                onClick={() => handleUpdateQuantity(row, row.quantity - 1)}
                disabled={isMutating || row.quantity <= 1}
                className="px-3 py-1 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                −
              </button>
              <span className="px-3 py-1 border-l border-r border-gray-200 text-xs font-bold">
                {row.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(row, row.quantity + 1)}
                disabled={isMutating}
                className="px-3 cursor-pointer py-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleRemoveItem(row.id)}
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
        );
      },
    },
    {
      name: "TOTAL",
      grow: 2,
      right: true,
      cell: (row) => (
        <div className="text-sm font-bold text-gray-900 text-right w-full">
          {getCurrencySymbol(row.currency)}
          {((row.unit_price_snapshot_cents / 100) * row.quantity).toFixed(2)}
        </div>
      ),
    },
  ];

  // Global alignment customStyles blueprint
  const customStyles = {
    table: {
      style: {
        backgroundColor: "transparent",
      },
    },
    header: {
      style: {
        display: "none",
      },
    },
    headRow: {
      style: {
        backgroundColor: "transparent",
        borderBottomWidth: "1px",
        borderBottomColor: "#e5e7eb", // Unified border-gray-200
        paddingLeft: "0px",
        paddingRight: "0px",
      },
    },
    headCells: {
      style: {
        color: "#6b7280", // text-gray-500
        fontSize: "0.875rem", // text-sm
        fontWeight: "500",
        paddingLeft: "0px",
        paddingRight: "0px",
        borderBottom: "none", // Stripping structural cell duplicate outlines
      },
    },
    rows: {
      style: {
        backgroundColor: "transparent",
        borderBottomWidth: "1px",
        borderBottomColor: "#e5e7eb", // Uniform line across columns
        minHeight: "auto",
        alignItems: "center",
        paddingLeft: "0px",
        paddingRight: "0px",
        "&:not(:last-of-type)": {
          borderBottomWidth: "1px",
          borderBottomColor: "#e5e7eb",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "0px",
        paddingRight: "0px",
        borderBottom: "none", // Eradicates uneven line-fragments underneath cells
      },
    },
  };

  if (isLoading) {
    return (
      <PrimaryLayout>
        <div className="min-h-screen mt-[5rem] bg-gray-50 py-8 flex justify-center items-center">
          <div className="animate-spin rounded-none h-10 w-10 border-2 border-black border-t-transparent"></div>
        </div>
      </PrimaryLayout>
    );
  }

  if (error) {
    return (
      <PrimaryLayout>
        <div className="min-h-screen mt-[5rem] bg-gray-50 text-gray-900 py-8 flex flex-col justify-center items-center px-4">
          <p className="text-gray-600 mb-4">Failed to load your cart session</p>
          <button
            onClick={() => refetchCart()}
            className="bg-black text-white px-6 py-2 font-medium tracking-wide text-sm hover:bg-gray-800 transition-colors rounded-none"
          >
            Try Again
          </button>
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
      <div className="min-h-screen mt-[5rem] bg-gray-50 text-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8 text-left text-gray-900">
            Your Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                <img
                  src="/images/cart-empty-removebg.png"
                  alt=""
                  className="h-40 mx-auto"
                />
              </div>
              <p className="text-gray-600 mb-6">Your cart is empty</p>
              <Link
                to="/product"
                className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors rounded-none"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* CART ITEMS CONTAINER */}
              <div className="lg:w-2/3 w-full">
                {/* DESKTOP ONLY: Unified smooth horizontal lines */}
                <div className="hidden md:block">
                  <DataTable
                    columns={columns}
                    data={cartItems}
                    customStyles={customStyles}
                  />
                </div>

                {/* MOBILE ONLY: Simple geometric elements */}
                <div className="md:hidden space-y-4">
                  <div className="bg-white border border-gray-200 rounded-none p-2">
                    {cartItems.map((item) => {
                      const currentSymbol = getCurrencySymbol(item.currency);
                      const itemPrice = item.unit_price_snapshot_cents / 100;
                      const productImage = getProductImage(item);
                      const isMutating = isUpdatingCart || isRemovingFromCart;
                      const isCurrentItemDeleting = deletingItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="flex w-full relative p-2 border-b border-gray-200 last:border-0 py-6"
                        >
                          <div className="h-28 w-24 flex-shrink-0 overflow-hidden bg-gray-100 rounded-none border border-gray-200 flex items-center justify-center">
                            <img
                              src={productImage}
                              alt={item.product_title}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="ml-4 flex flex-col justify-between flex-1 pr-6">
                            <div>
                              <Link to={`/product/${item?.product_id}`}>
                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                                  {item.product_title || "Product Item"}
                                </h3>
                              </Link>
                              <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                                <div>
                                  Color:{" "}
                                  <span className="text-gray-900 font-medium">
                                    {item.color || "Default"}
                                  </span>
                                </div>
                                <div>
                                  Size:{" "}
                                  <span className="text-gray-900 font-medium">
                                    {item.size || "One Size"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-col gap-2">
                              <div className="text-sm font-bold text-gray-900">
                                {currentSymbol}
                                {itemPrice.toFixed(2)}
                              </div>

                              <div className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 h-10 rounded-none px-2">
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={isMutating || item.quantity <= 1}
                                  className="text-lg font-medium text-gray-500 hover:text-black transition-colors px-2 disabled:opacity-30 cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="text-xs font-bold text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={isMutating}
                                  className="text-lg font-medium text-gray-500 hover:text-black transition-colors px-2 disabled:opacity-30 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isMutating}
                            className="absolute right-0 top-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            {isCurrentItemDeleting ? (
                              <div className="animate-spin rounded-none h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                            ) : (
                              <IoCloseOutline size={22} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STICKY GEOMETRIC ORDER SUMMARY MODULE */}
              <div className="lg:w-1/3 w-full">
                <div className="bg-white border border-gray-200 rounded-none p-6 sticky top-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                    Order Summary
                  </h2>

                  <div className="space-y-2 border-b border-gray-200 pb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-gray-900">
                        {activeCurrencySymbol}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4 mb-6">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-extrabold text-gray-900">
                      {activeCurrencySymbol}
                      {total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/checkout", { state: { products: cartItems } })
                    }
                    className="w-full bg-black text-white py-3.5 text-sm font-bold tracking-wide hover:bg-gray-800 transition-all rounded-none shadow-sm cursor-pointer"
                  >
                    Checkout · {activeCurrencySymbol}
                    {total.toFixed(2)}
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
