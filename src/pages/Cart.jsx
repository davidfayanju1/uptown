import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PrimaryLayout from "../layout/PrimaryLayout";
import { IoCloseOutline, IoChevronForward } from "react-icons/io5";
import { BsTrash } from "react-icons/bs";
import { useCart } from "../hooks/useCart";
import { useGatewayBackGuard } from "../hooks/useGatewayBackGuard";
import ImageLoader from "../components/load-states/image-center-loader";
import { toast } from "sonner";
import {
  formatCurrency,
  getCurrencySymbol,
  formatPriceFromUnits,
} from "../utils/currency";

const Cart = () => {
  const navigate = useNavigate();

  // Back from here would otherwise land on the expired gateway page.
  useGatewayBackGuard("/");
  const [deletingItemId, setDeletingItemId] = useState(null);
  const {
    cartItems,
    isLoading,
    error,
    refetchCart,
    updateCartItem,
    removeCartItem,
    isRemovingFromCart,
  } = useCart();

  const activeCurrencySymbol =
    cartItems.length > 0 ? getCurrencySymbol(cartItems[0].currency) : "₦";

  // IMPORTANT: unit_price_snapshot_cents is actually in regular units (not cents)
  // So we use it directly without dividing by 100
  const subtotal = cartItems.reduce(
    (total, item) => total + item.unit_price_snapshot_cents * item.quantity,
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

  // The new quantity lands in the cache immediately; useCart rolls it back and
  // reports the reason if the request fails.
  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;

    const maxAvailableStock = item.max_stock || 10;
    if (newQuantity > maxAvailableStock) {
      toast.error(
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
          {formatPriceFromUnits(row.unit_price_snapshot_cents, row.currency)}
        </div>
      ),
    },
    {
      name: "QUANTITY",
      grow: 3,
      cell: (row) => {
        const isCurrentItemDeleting = deletingItemId === row.id;
        return (
          <div className="flex items-center">
            <div className="flex items-center border border-gray-200 bg-white">
              <button
                onClick={() => handleUpdateQuantity(row, row.quantity - 1)}
                disabled={isRemovingFromCart || row.quantity <= 1}
                className="px-3 py-1 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                −
              </button>
              <span className="px-3 py-1 border-l border-r border-gray-200 text-xs font-bold">
                {row.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(row, row.quantity + 1)}
                disabled={isRemovingFromCart}
                className="px-3 cursor-pointer py-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleRemoveItem(row.id)}
              disabled={isRemovingFromCart}
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
          {formatPriceFromUnits(
            row.unit_price_snapshot_cents * row.quantity,
            row.currency,
          )}
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
        borderBottomColor: "#e5e7eb",
        paddingLeft: "0px",
        paddingRight: "0px",
      },
    },
    headCells: {
      style: {
        color: "#6b7280",
        fontSize: "0.875rem",
        fontWeight: "500",
        paddingLeft: "0px",
        paddingRight: "0px",
        borderBottom: "none",
      },
    },
    rows: {
      style: {
        backgroundColor: "transparent",
        borderBottomWidth: "1px",
        borderBottomColor: "#e5e7eb",
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
        borderBottom: "none",
      },
    },
  };

  if (isLoading) {
    return (
      <PrimaryLayout>
        <ImageLoader />
        <div className="min-h-screen mt-[5rem] bg-gray-50 py-8 flex justify-center items-center font-now">
          <div className="animate-spin rounded-none h-10 w-10 border-2 border-black border-t-transparent"></div>
        </div>
      </PrimaryLayout>
    );
  }

  if (error) {
    return (
      <PrimaryLayout>
        <div className="min-h-screen mt-[5rem] bg-gray-50 text-gray-900 py-8 flex flex-col justify-center items-center px-4 font-now">
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
      <div className="min-h-screen mt-[5rem] bg-gray-50 text-gray-900 py-8 pb-28 md:pb-8 font-now">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-[20.4px] leading-none md:text-3xl font-normal md:font-bold mb-6 md:mb-8 text-left text-gray-900">
            My shopping cart
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

                {/* MOBILE ONLY: one bordered card per line item */}
                <div className="md:hidden space-y-4">
                  {cartItems.map((item) => {
                    const productImage = getProductImage(item);
                    const isCurrentItemDeleting = deletingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="relative bg-white border border-gray-200 p-5"
                      >
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemovingFromCart}
                          aria-label="Remove item"
                          className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          {isCurrentItemDeleting ? (
                            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                          ) : (
                            <IoCloseOutline size={24} />
                          )}
                        </button>

                        <div className="flex gap-4">
                          <Link
                            to={`/product/${item?.product_id}`}
                            className="h-[7.5rem] w-[6.5rem] flex-shrink-0 overflow-hidden bg-gray-100"
                          >
                            <img
                              src={productImage}
                              alt={item.product_title}
                              className="h-full w-full object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item?.product_id}`}>
                              <h3 className="text-[13.1px] uppercase font-extrabold text-gray-900 leading-snug">
                                {item.product_title || "Product Item"}
                              </h3>
                            </Link>
                            <div className="mt-2 text-[13px] text-gray-500 space-y-0.5">
                              <div>
                                Color:{" "}
                                <span className="text-gray-900 font-semibold">
                                  {item.color || "Default"}
                                </span>
                              </div>
                              <div>
                                Size:{" "}
                                <span className="text-gray-900 font-semibold">
                                  {item.size || "One Size"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between border border-gray-200 bg-gray-50 h-11 px-4">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item, item.quantity - 1)
                                }
                                disabled={
                                  isRemovingFromCart || item.quantity <= 1
                                }
                                aria-label="Decrease quantity"
                                className="text-xl leading-none text-gray-500 hover:text-black transition-colors px-2 disabled:opacity-30 cursor-pointer"
                              >
                                −
                              </button>
                              <span className="text-sm font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item, item.quantity + 1)
                                }
                                disabled={isRemovingFromCart}
                                aria-label="Increase quantity"
                                className="text-xl leading-none text-gray-500 hover:text-black transition-colors px-2 disabled:opacity-30 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gifting and packaging — presentational for now, no backend */}
                <div className="md:hidden mt-10">
                  <div className="flex items-end justify-between mb-3">
                    <h2 className="text-[15px] text-gray-900">
                      Gifting and Packaging
                    </h2>
                    <span className="text-[14px] text-gray-400">
                      Complimentary
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/gift-message")}
                    className="w-full flex items-center gap-4 bg-white p-4 text-left"
                  >
                    <img
                      src="/images/gifting-packaging.jpg"
                      alt=""
                      className="h-[5.5rem] w-[7rem] flex-shrink-0 object-cover"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-bold text-gray-900">
                        Include a Gift Message
                      </span>
                      <span className="block mt-1 text-[10.7px] text-gray-400">
                        Add a personal touch to your order.
                      </span>
                    </span>
                    <IoChevronForward
                      size={20}
                      className="text-gray-400 flex-shrink-0"
                    />
                  </button>
                </div>
              </div>

              {/* STICKY GEOMETRIC ORDER SUMMARY MODULE */}
              <div className="lg:w-1/3 w-full">
                <div className="bg-white border border-gray-200 rounded-none p-6 sticky top-8">
                  <h2 className="text-[18.7px] font-bold text-gray-900 mb-5">
                    Order Summary
                  </h2>

                  <div className="space-y-2 border-b border-gray-200 pb-5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-600 text-[16.3px]">
                        Subtotal
                      </span>
                      <span className="font-bold text-gray-900 text-[15.5px]">
                        {formatPriceFromUnits(
                          subtotal,
                          cartItems[0]?.currency || "NGN",
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline mt-5 mb-6">
                    <span className="text-[18.7px] font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-[15.5px] font-bold text-gray-900">
                      {formatPriceFromUnits(
                        total,
                        cartItems[0]?.currency || "NGN",
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/checkout", { state: { products: cartItems } })
                    }
                    className="hidden md:block w-full bg-black text-white py-3.5 text-sm font-bold tracking-wide hover:bg-gray-800 transition-all rounded-none shadow-sm cursor-pointer"
                  >
                    Checkout ·{" "}
                    {formatPriceFromUnits(
                      total,
                      cartItems[0]?.currency || "NGN",
                    )}
                  </button>

                  <div className="hidden md:block mt-4 text-center text-sm text-gray-500">
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

      {/* Fixed checkout bar — mobile only; desktop keeps the sticky summary CTA */}
      {cartItems.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 font-now">
          <button
            onClick={() =>
              navigate("/checkout", { state: { products: cartItems } })
            }
            className="w-full bg-white border border-gray-900 py-5 text-center text-[1.05rem] font-bold text-gray-900 cursor-pointer"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </PrimaryLayout>
  );
};

export default Cart;
