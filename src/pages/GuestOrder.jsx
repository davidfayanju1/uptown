// GuestOrder.jsx — order lookup by payment reference, for shoppers who
// checked out without an account and have no /orders list to fall back on.
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import PrimaryLayout from "../layout/PrimaryLayout";
import api from "../lib/axios";
import {
  formatDate,
  formatMoney,
  formatStatus,
  getStatusStyles,
} from "../utils/orders";

const fetchOrderByReference = async (reference) => {
  const response = await api.get(
    `/v1/payments/${encodeURIComponent(reference)}/order`,
  );
  const data = response.data;
  if (!data.status) throw new Error(data.message || "Order not found");
  return data.data;
};

const GuestOrder = () => {
  const { reference } = useParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["guest-order", reference],
    queryFn: () => fetchOrderByReference(reference),
    enabled: !!reference,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const order = data?.order || data;
  const items = data?.items || [];
  const snap = order?.totals_snapshot_json || {};
  const currency = snap.currency || order?.currency;
  const addr = order?.shipping_address;

  return (
    <PrimaryLayout>
      <div className="min-h-screen pt-[5rem] bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#1C1C1A]">
              Your order
            </h1>
            <p className="text-sm text-[#8C8C86] mt-1.5">
              Tracked by payment reference
              <span className="font-mono text-[#6B6B64] break-all">
                {" "}
                {reference}
              </span>
            </p>
          </div>

          {isLoading && (
            <div className="border border-[#EBE9E4] bg-white animate-pulse">
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#FAF9F7] border-b border-[#EBE9E4] flex justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded" />
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                    <div className="h-3 w-14 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && (error || !order) && (
            <div className="text-center py-12 border border-[#EBE9E4]">
              <p className="text-[#1C1C1A]">
                We couldn&apos;t find an order for this reference.
              </p>
              <p className="text-sm text-[#8C8C86] mt-2 max-w-sm mx-auto">
                If you&apos;ve just paid, it may take a moment to appear. If you
                were charged, quote the reference above to our team and
                we&apos;ll sort it out.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => refetch()}
                  className="border border-[#1C1C1A] px-6 py-2.5 text-sm uppercase tracking-wide hover:bg-[#1C1C1A] hover:text-white transition-colors"
                >
                  Try again
                </button>
                <Link
                  to="/product"
                  className="text-sm text-[#8C8C86] hover:text-[#1C1C1A] transition-colors underline underline-offset-4"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          )}

          {!isLoading && order && (
            <div className="border border-[#EBE9E4] bg-white">
              {/* Header */}
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#FAF9F7] border-b border-[#EBE9E4]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <div>
                      <span className="text-[#8C8C86] text-xs uppercase tracking-wide block">
                        Order number
                      </span>
                      <span className="font-mono text-[#1C1C1A] text-sm font-medium">
                        {order.id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    {order.created_at && (
                      <div>
                        <span className="text-[#8C8C86] text-xs uppercase tracking-wide block">
                          Date placed
                        </span>
                        <span className="text-[#1C1C1A] text-sm">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[#8C8C86] text-xs uppercase tracking-wide block">
                        Total
                      </span>
                      <span className="text-[#1C1C1A] text-sm font-medium">
                        {formatMoney(snap.grand_total_cents, currency)}
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

              <div className="p-4 sm:p-5 space-y-6">
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

                <div>
                  <p className="text-xs text-[#8C8C86] uppercase tracking-wide mb-3">
                    Order summary
                  </p>
                  <div className="space-y-2 text-sm">
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
                    <div className="flex justify-between font-medium text-[#1C1C1A] pt-3 border-t border-[#EBE9E4]">
                      <span>Grand total</span>
                      <span>
                        {formatMoney(snap.grand_total_cents, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#8C8C86] pt-1">
                  Keep this link — it&apos;s how you check on this order without
                  an account.{" "}
                  <Link
                    to="/signup"
                    className="text-[#1C1C1A] underline underline-offset-4"
                  >
                    Create an account
                  </Link>{" "}
                  to see all your orders in one place.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default GuestOrder;
