import React from "react";
import { useQuery } from "@tanstack/react-query";
import PrimaryLayout from "../layout/PrimaryLayout";
import api from "../lib/axios";

// API service functions using axios
const fetchOrders = async () => {
  try {
    const response = await api.get("/v1/orders");
    const data = response.data;
    if (!data.status) {
      throw new Error(data.message || "Failed to fetch orders");
    }
    return data.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to fetch orders");
    }
    throw new Error(error.message || "Network error");
  }
};

const fetchOrderById = async (id) => {
  try {
    const response = await api.get(`/v1/orders/${id}`);
    const data = response.data;
    if (!data.status) {
      throw new Error(data.message || "Failed to fetch order details");
    }
    return data.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.message || "Failed to fetch order details",
      );
    }
    throw new Error(error.message || "Network error");
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Helper function to get status styles
const getStatusStyles = (status) => {
  const statusLower = status?.toLowerCase() || "";
  switch (statusLower) {
    case "delivered":
    case "completed":
      return "bg-[#EFF3EA] text-[#3B5C2E]";
    case "shipped":
      return "bg-[#E8EDF2] text-[#2C4C6B]";
    case "processing":
    case "pending":
      return "bg-[#F5F0E8] text-[#8B6B3D]";
    case "cancelled":
      return "bg-[#F5E8E8] text-[#8B3D3D]";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Helper to format status for display
const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Helper to extract order total from snapshot
const getOrderTotal = (snapshot, currency) => {
  const total =
    snapshot?.total || snapshot?.order_total || snapshot?.grand_total;
  if (typeof total === "number") {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
    }).format(total);
  }
  return currency === "GBP" ? "£0.00" : `0.00 ${currency}`;
};

// Order Card Component
const OrderCard = ({ order, onViewDetails }) => {
  // Mock item data - in a real app, you'd get this from a separate items endpoint or from the order details
  const mockItems = [
    {
      id: "item-1",
      brand: "Sample Brand",
      name: "Order Items",
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=120&h=120&fit=crop",
    },
  ];

  const total = getOrderTotal(order.totals_snapshot_json, order.currency);

  return (
    <div className="border border-[#EBE9E4] bg-white transition-all hover:border-[#D4D1CA]">
      {/* Order Header */}
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
                {total}
              </span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 uppercase tracking-wide font-medium self-start sm:self-auto ${getStatusStyles(
              order.status,
            )}`}
          >
            {formatStatus(order.status)}
          </span>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-4 sm:p-5">
        <div className="flex gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F4F0] flex-shrink-0 overflow-hidden">
            <img
              src={mockItems[0].image}
              alt={mockItems[0].name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8C8C86] uppercase tracking-wide mb-0.5">
              {mockItems[0].brand}
            </p>
            <p className="text-[#1C1C1A] text-sm leading-snug break-words">
              {mockItems[0].name}
            </p>
            <p className="text-xs text-[#8C8C86] mt-1.5">
              {mockItems[0].quantity} item
              {mockItems[0].quantity !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-3 mt-4 pt-1 border-t border-[#F0EFEA]">
          <button
            onClick={() => onViewDetails(order.id)}
            className="text-sm text-[#1C1C1A] font-medium underline underline-offset-4 decoration-[#D4D1CA] hover:decoration-[#1C1C1A] transition-colors mt-3"
          >
            View details
          </button>
          <button className="text-sm text-[#1C1C1A] border border-[#D4D1CA] px-4 py-1.5 hover:bg-[#F4F3EF] transition-colors mt-3">
            Buy again
          </button>
          {order.status?.toLowerCase() === "delivered" && (
            <button className="text-sm text-[#8C8C86] hover:text-[#1C1C1A] transition-colors underline underline-offset-2 mt-3">
              Write a review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const OrderSkeleton = () => (
  <div className="border border-[#EBE9E4] bg-white animate-pulse">
    <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#FAF9F7] border-b border-[#EBE9E4]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="space-y-1">
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="p-4 sm:p-5">
      <div className="flex gap-4 sm:gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Main Orders Component
const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = React.useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);

  // Query for orders list
  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for single order details (only when selected)
  const { data: selectedOrder, isLoading: isLoadingOrderDetails } = useQuery({
    queryKey: ["order", selectedOrderId],
    queryFn: () => fetchOrderById(selectedOrderId),
    enabled: !!selectedOrderId,
    staleTime: 5 * 60 * 1000,
  });

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrderId(null);
  };

  if (error) {
    return (
      <PrimaryLayout>
        <div className="min-h-screen pt-[5rem] bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            <div className="text-center py-12 border border-red-200 bg-red-50">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-[#1C1C1A] font-light text-lg">
                Failed to load orders
              </h3>
              <p className="text-[#8C8C86] text-sm mt-1">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong"}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-6 border border-[#1C1C1A] bg-transparent px-6 py-2 text-sm uppercase tracking-wide hover:bg-[#1C1C1A] hover:text-white transition-colors"
              >
                Try again
              </button>
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

          {/* Orders List */}
          <div className="space-y-5 sm:space-y-6">
            {isLoading ? (
              // Loading skeletons
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
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              // Empty state
              <div className="text-center py-12 sm:py-16 border border-[#EBE9E4] bg-[#FAF9F7]">
                <div className="text-4xl sm:text-5xl mb-3 opacity-40">🛍️</div>
                <h3 className="text-[#1C1C1A] font-light text-lg sm:text-xl">
                  No orders yet
                </h3>
                <p className="text-[#8C8C86] text-sm mt-1 max-w-xs mx-auto px-4">
                  When you make your first purchase, it will appear here.
                </p>
                <button className="mt-6 border border-[#1C1C1A] bg-transparent px-6 py-2 text-sm uppercase tracking-wide hover:bg-[#1C1C1A] hover:text-white transition-colors">
                  Start shopping
                </button>
              </div>
            )}
          </div>

          {/* Order Details Modal */}
          {isDetailsModalOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <div
                className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-[#EBE9E4] px-5 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-light tracking-wide text-[#1C1C1A]">
                    Order Details
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-[#8C8C86] hover:text-[#1C1C1A] text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="p-5">
                  {isLoadingOrderDetails ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ) : selectedOrder ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-3 pb-3 border-b border-[#EBE9E4]">
                        <div>
                          <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                            Order ID
                          </p>
                          <p className="font-mono text-sm">
                            {selectedOrder.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                            Status
                          </p>
                          <span
                            className={`inline-block text-xs px-2.5 py-1 uppercase tracking-wide font-medium ${getStatusStyles(
                              selectedOrder.status,
                            )}`}
                          >
                            {formatStatus(selectedOrder.status)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                            Date placed
                          </p>
                          <p className="text-sm">
                            {formatDate(selectedOrder.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8C8C86] uppercase tracking-wide">
                            Currency
                          </p>
                          <p className="text-sm">
                            {selectedOrder.currency || "GBP"}
                          </p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#EBE9E4]">
                        <p className="text-xs text-[#8C8C86] uppercase tracking-wide mb-2">
                          Order Summary
                        </p>
                        <pre className="text-xs bg-[#FAF9F7] p-3 overflow-auto rounded">
                          {JSON.stringify(
                            selectedOrder.totals_snapshot_json,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-[#8C8C86]">
                      Order details not available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subtle Footer Note */}
          <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#EBE9E4] text-center text-xs text-[#8C8C86]">
            Need help? Contact our customer service team at{" "}
            <a
              href="mailto:help@brand.co.uk"
              className="underline underline-offset-2 hover:text-[#1C1C1A]"
            >
              help@brand.co.uk
            </a>
          </div>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default Orders;
