// utils/orders.js — presentation helpers shared by the orders screens.

export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatMoney = (cents, currency) => {
  if (typeof cents !== "number") return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "NGN",
  }).format(cents / 100);
};

export const getStatusStyles = (status) => {
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

export const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
