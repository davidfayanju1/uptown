import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PrimaryLayout from "../layout/PrimaryLayout";
import api from "../lib/axios";

const makeApiError = (error, fallback) => {
  if (error.response?.status === 401) {
    const err = new Error("You must be signed in to view your orders.");
    err.code = "UNAUTHORIZED";
    return err;
  }
  if (error.request && !error.response) {
    const err = new Error(
      "Unable to connect. Please check your internet connection.",
    );
    err.code = "NETWORK_ERROR";
    return err;
  }
  return new Error(error.response?.data?.message || error.message || fallback);
};

const fetchOrders = async () => {
  try {
    const response = await api.get("/v1/orders");
    const data = response.data;
    if (!data.status) throw new Error(data.message || "Failed to fetch orders");
    return data.data;
  } catch (error) {
    throw makeApiError(error, "Failed to fetch orders");
  }
};

const fetchOrderById = async (id) => {
  try {
    const response = await api.get(`/v1/orders/${id}`);
    const data = response.data;
    if (!data.status)
      throw new Error(data.message || "Failed to fetch order details");
    return data.data;
  } catch (error) {
    throw makeApiError(error, "Failed to fetch order details");
  }
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatMoney = (cents, currency) => {
  if (typeof cents !== "number") return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "NGN",
  }).format(cents / 100);
};

const getStatusStyles = (status) => {
  switch (status?.toUpperCase()) {
    case "DELIVERED":
    case "COMPLETED":
      return "bg-[#EFF3EA] text-[#3B5C2E]";
    case "SHIPPED":
    case "FULFILLING":
      return "bg-[#E8EDF2] text-[#2C4C6B]";
    case "PROCESSING":
    case "PENDING":
    case "PENDING_PAYMENT":
      return "bg-[#F5F0E8] text-[#8B6B3D]";
    case "CANCELLED":
      return "bg-[#F5E8E8] text-[#8B3D3D]";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onViewDetails }) => {
  const snap = order.totals_snapshot_json || {};
  const currency = snap.currency || order.currency;
  const grandTotal = formatMoney(snap.grand_total_cents, currency);

  return (
    <div className="border border-[#EBE9E4] bg-white transition-all hover:border-[#D4D1CA]">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#FAF9F7] border-b border-[#EBE9E4]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <div>
              <span className="text-[#8C8C86] text-xs uppercase tracking-wide block">
                Order number
              </span>
              <span className="font-mono text-[#1C1C1A] text-sm font-medium">
                {order.id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-[#8C8C86] text-xs uppercase tracking-wide block">
                Date placed
              </span>
              <span className="text-[#1C1C1A] text-sm">
                {formatDate(order.created_at)}
              </span>
            </div>
            <div>
              <span className="text-[#8C8C86] text-xs uppercase tracking-wide block">
                Total
              </span>
              <span className="text-[#1C1C1A] text-sm font-medium">
                {grandTotal}
              </span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 uppercase tracking-wide font-medium self-start sm:self-auto ${getStatusStyles(order.status)}`}
          >
            {formatStatus(order.status)}
          </span>
        </div>
      </div>

      {/* Totals breakdown */}
      <div className="p-4 sm:p-5">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-[#6B6B64]">
            <span>Subtotal</span>
            <span>{formatMoney(snap.subtotal_cents, currency)}</span>
          </div>
          <div className="flex justify-between text-[#6B6B64]">
            <span>Shipping</span>
            <span>
              {snap.shipping_cents === 0
                ? "Free"
                : formatMoney(snap.shipping_cents, currency)}
            </span>
          </div>
          <div className="flex justify-between text-[#6B6B64]">
            <span>Tax</span>
            <span>{formatMoney(snap.tax_cents, currency)}</span>
          </div>
          {snap.discount_cents > 0 && (
            <div className="flex justify-between text-[#3B5C2E]">
              <span>Discount</span>
              <span>−{formatMoney(snap.discount_cents, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-[#1C1C1A] pt-2 border-t border-[#F0EFEA] mt-1">
            <span>Grand total</span>
            <span>{grandTotal}</span>
          </div>
        </div>

        {/* Shipping destination */}
        {order.shipping_address && (
          <p className="text-xs text-[#8C8C86] mt-3">
            Ships to{" "}
            <span className="text-[#1C1C1A]">
              {order.shipping_address.first_name}{" "}
              {order.shipping_address.last_name}
            </span>
            {" · "}
            {order.shipping_address.city}, {order.shipping_address.state}
          </p>
        )}

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#F0EFEA]">
          <button
            onClick={() => onViewDetails(order.id)}
            className="text-sm text-[#1C1C1A] font-medium underline underline-offset-4 decoration-[#D4D1CA] hover:decoration-[#1C1C1A] transition-colors"
          >
            View details
          </button>
          {order.status?.toUpperCase() === "DELIVERED" && (
            <button className="text-sm text-[#8C8C86] hover:text-[#1C1C1A] transition-colors underline underline-offset-2">
              Write a review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const OrderSkeleton = () => (
  <div className="border border-[#EBE9E4] bg-white animate-pulse">
    <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#FAF9F7] border-b border-[#EBE9E4]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="space-y-1">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="p-4 sm:p-5 space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ── Order Detail Modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ orderId, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });

  const order = data?.order;
  const items = data?.items || [];
  const snap = order?.totals_snapshot_json || {};
  const snapCurrency = snap.currency || order?.currency;
  const addr = order?.shipping_address;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-white border-b border-[#EBE9E4] px-5 py-4 flex justify-between items-center">
          <h2 className="text-xl font-light tracking-wide text-[#1C1C1A]">
            Order Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#8C8C86] hover:text-[#1C1C1A] text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* ID + Status */}
              <div className="flex justify-between items-start flex-wrap gap-3 pb-4 border-b border-[#EBE9E4]">
                <div>
                  <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                    Order ID
                  </p>
                  <p className="font-mono text-sm mt-0.5 break-all">
                    {order.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                    Status
                  </p>
                  <span
                    className={`inline-block text-xs px-2.5 py-1 mt-0.5 uppercase tracking-wide font-medium ${getStatusStyles(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#EBE9E4]">
                <div>
                  <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                    Date placed
                  </p>
                  <p className="text-sm mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                    Last updated
                  </p>
                  <p className="text-sm mt-0.5">{formatDate(order.updated_at)}</p>
                </div>
              </div>

              {/* Items */}
              {items.length > 0 && (
                <div className="pb-4 border-b border-[#EBE9E4]">
                  <p className="text-xs text-[#8C8C86] uppercase tracking-wide mb-3">
                    Items ({items.length})
                  </p>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-[#F5F4F0] flex-shrink-0 overflow-hidden">
                          {item.variant_images?.[0] ? (
                            <img
                              src={item.variant_images[0]}
                              alt={item.product_title}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1C1C1A] leading-snug">
                            {item.product_title}
                          </p>
                          <p className="text-xs text-[#8C8C86] mt-0.5">
                            {item.color} · {item.size} · Qty {item.quantity}
                          </p>
                          <p className="text-xs text-[#6B6B64] mt-0.5 font-mono">
                            {item.sku}
                          </p>
                        </div>
                        <div className="text-sm text-[#1C1C1A] font-medium whitespace-nowrap">
                          {formatMoney(
                            item.unit_price_snapshot_cents * item.quantity,
                            item.currency,
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping address */}
              {addr && (
                <div className="pb-4 border-b border-[#EBE9E4]">
                  <p className="text-xs text-[#8C8C86] uppercase tracking-wide mb-2">
                    Shipping address
                  </p>
                  <p className="text-sm text-[#1C1C1A]">
                    {addr.first_name} {addr.last_name}
                  </p>
                  <p className="text-sm text-[#6B6B64]">{addr.line1}</p>
                  <p className="text-sm text-[#6B6B64]">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-sm text-[#6B6B64]">{addr.country}</p>
                  {addr.email && (
                    <p className="text-sm text-[#6B6B64] mt-1">{addr.email}</p>
                  )}
                </div>
              )}

              {/* Financial breakdown */}
              <div>
                <p className="text-xs text-[#8C8C86] uppercase tracking-wide mb-3">
                  Order summary
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#6B6B64]">
                    <span>Subtotal</span>
                    <span>{formatMoney(snap.subtotal_cents, snapCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B6B64]">
                    <span>Shipping</span>
                    <span>
                      {snap.shipping_cents === 0
                        ? "Free"
                        : formatMoney(snap.shipping_cents, snapCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6B6B64]">
                    <span>Tax</span>
                    <span>{formatMoney(snap.tax_cents, snapCurrency)}</span>
                  </div>
                  {snap.discount_cents > 0 && (
                    <div className="flex justify-between text-[#3B5C2E]">
                      <span>Discount</span>
                      <span>
                        −{formatMoney(snap.discount_cents, snapCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-[#1C1C1A] pt-3 border-t border-[#EBE9E4]">
                    <span>Grand total</span>
                    <span>
                      {formatMoney(snap.grand_total_cents, snapCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-[#8C8C86]">
              Order details not available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    const isAuthError = error.code === "UNAUTHORIZED";
    const isNetworkError = error.code === "NETWORK_ERROR";

    return (
      <PrimaryLayout>
        <div className="min-h-screen pt-[5rem] bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            <div
              className={`text-center py-12 border ${
                isAuthError
                  ? "border-amber-200 bg-amber-50"
                  : isNetworkError
                    ? "border-gray-200 bg-gray-50"
                    : "border-red-200 bg-red-50"
              }`}
            >
              <h3 className="text-[#1C1C1A] font-light text-lg">
                {isAuthError
                  ? "Sign in required"
                  : isNetworkError
                    ? "Connection error"
                    : "Failed to load orders"}
              </h3>
              <p className="text-[#8C8C86] text-sm mt-1 max-w-xs mx-auto">
                {error.message}
              </p>
              {isAuthError ? (
                <Link
                  to="/signin"
                  className="inline-block mt-6 border border-[#1C1C1A] bg-transparent px-6 py-2 text-sm uppercase tracking-wide hover:bg-[#1C1C1A] hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              ) : (
                <button
                  onClick={() => refetch()}
                  className="mt-6 border border-[#1C1C1A] bg-transparent px-6 py-2 text-sm uppercase tracking-wide hover:bg-[#1C1C1A] hover:text-white transition-colors"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      </PrimaryLayout>
    );
  }

  return (
    <PrimaryLayout>
      <div className="min-h-screen pt-[5rem] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Page Header */}
          <div className="border-b border-[#EBE9E4] pb-5 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#1C1C1A]">
                  Your Orders
                </h1>
                <p className="text-[#6B6B64] text-sm mt-1.5 font-light">
                  View and track your recent purchases
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="text-sm text-[#8C8C86] hover:text-[#1C1C1A] transition-colors underline underline-offset-2 self-start sm:self-auto"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Orders list */}
          <div className="space-y-5 sm:space-y-6">
            {isLoading ? (
              <>
                <OrderSkeleton />
                <OrderSkeleton />
                <OrderSkeleton />
              </>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={setSelectedOrderId}
                />
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 border border-[#EBE9E4] bg-[#FAF9F7]">
                <h3 className="text-[#1C1C1A] font-light text-lg sm:text-xl">
                  No orders yet
                </h3>
                <p className="text-[#8C8C86] text-sm mt-1 max-w-xs mx-auto px-4">
                  When you make your first purchase, it will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Detail modal */}
          {selectedOrderId && (
            <OrderDetailModal
              orderId={selectedOrderId}
              onClose={() => setSelectedOrderId(null)}
            />
          )}

          {/* Footer note */}
          <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#EBE9E4] text-center text-xs text-[#8C8C86]">
            Need help? Contact our customer service team at{" "}
            <a
              href="mailto:thenonamestudios@gmail.com"
              className="underline underline-offset-2 hover:text-[#1C1C1A]"
            >
              thenonamestudios@gmail.com
            </a>
          </div>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default Orders;
