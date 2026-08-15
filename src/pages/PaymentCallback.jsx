// PaymentCallback.jsx — landing page for the gateway's site_redirect_url.
// Verifies the transaction, confirms it to the shopper, then hands off to /orders.
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { FiAlertCircle, FiX } from "react-icons/fi";
import AnimatedCheckmark from "../components/UI/AnimatedCheckmark";
import useUserStore from "../stores/auth-store";
import { formatPriceFromCents } from "../utils/currency";
import api from "../lib/axios";

const REDIRECT_SECONDS = 6;

// The API answers errors with
// { status: false, status_code, error_type, message, errors: { reason } }
// where `message` is often a bare word ("forbidden"). The reason lives in
// `errors.reason`, so pull the whole envelope apart rather than trusting
// `message` alone.
const describeError = (error) => {
  const status = error.response?.status;
  const body = error.response?.data;
  const reason = body?.errors?.reason;

  if (!error.response) {
    return {
      message: error.request
        ? "We couldn't reach our servers to confirm this payment."
        : "We couldn't confirm this payment.",
      detail: null,
    };
  }

  // 401/403 mean the request arrived with an identity the payment doesn't
  // belong to — an expired session, or a different account than the one that
  // checked out. Retrying as-is lands the same way, so say what to do instead.
  const message =
    status === 403
      ? "This payment is registered to a different account or session, so it can't be confirmed from here. Sign in with the account you used at checkout — if the payment went through, the order is waiting under your orders."
      : status === 401
        ? "Your session expired before we could confirm this payment. Sign in again and check your orders."
        : // A one-word message ("forbidden") is the error type, not an
          // explanation — the detail line below carries that.
          body?.message?.includes(" ")
          ? body.message
          : "We couldn't confirm this payment.";

  return {
    message,
    // Kept visible: this is what makes a failed verification diagnosable
    // when a shopper reports it.
    detail: [status, body?.error_type, reason].filter(Boolean).join(" · "),
  };
};

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUserStore();

  // Interswitch returns `txnref`; Paystack sends `trxref` and `reference`.
  const reference =
    searchParams.get("txnref") ||
    searchParams.get("trxref") ||
    searchParams.get("reference");

  // Interswitch signals the outcome with `resp` — "00" is the only approved
  // code. Anything else means no money moved, but the backend stays the
  // authority on that, so this only softens the copy.
  const gatewayCode = searchParams.get("resp") || searchParams.get("respcode");
  const gatewayDidNotApprove = !!gatewayCode && gatewayCode !== "00";

  const [status, setStatus] = useState(reference ? "verifying" : "missing");
  const [details, setDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  // Guards the double-invoke of effects under StrictMode so we only verify once.
  const hasVerified = useRef(false);

  const verifyPayment = useCallback(async () => {
    setStatus("verifying");
    setErrorDetail("");
    setNeedsSignIn(false);

    console.log("🔵 Callback params:", Object.fromEntries(searchParams));
    console.log(
      "🔵 Reference — sent:",
      sessionStorage.getItem("last-txn-ref"),
      "| returned:",
      reference,
    );

    try {
      const response = await api.get(
        `/v1/payments/verify/${encodeURIComponent(reference)}`,
      );
      const body = response.data;
      console.log("✅ Verify response:", body);

      if (!body?.status) {
        setErrorMessage(body?.message || "This payment could not be verified.");
        setErrorDetail(
          [body?.error_type, body?.errors?.reason].filter(Boolean).join(" · "),
        );
        setStatus(gatewayDidNotApprove ? "cancelled" : "failed");
        return;
      }

      setDetails(body.data || null);
      setStatus("success");

      // The order now exists and the cart has been emptied server-side.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      console.log("❌ Verify failed:", error.response?.status, error.response?.data);

      // A cancelled transaction often has no payment record to verify, so a
      // 404 here alongside a non-approval code is the expected shape.
      // …but an auth failure is never a cancellation, and softening it to one
      // hides the actual problem behind reassuring copy.
      const authFailure = [401, 403].includes(error.response?.status);
      if (gatewayDidNotApprove && !authFailure) {
        setStatus("cancelled");
        return;
      }

      const { message, detail } = describeError(error);
      setErrorMessage(message);
      setErrorDetail(detail || "");
      setNeedsSignIn(authFailure);
      setStatus("failed");
    }
  }, [reference, queryClient, gatewayDidNotApprove, searchParams]);

  useEffect(() => {
    if (!reference || hasVerified.current) return;
    hasVerified.current = true;
    verifyPayment();
  }, [reference, verifyPayment]);

  // A guest has no orders list to land on, so their order is reachable only
  // by the payment reference they just paid with.
  const orderPath = isAuthenticated
    ? "/orders"
    : `/order/${encodeURIComponent(reference || "")}`;

  // Auto-advance to the order once the payment is confirmed.
  useEffect(() => {
    if (status !== "success") return;

    const tick = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          navigate(orderPath, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [status, navigate, orderPath]);

  const order = details?.order || details;
  const snap = order?.totals_snapshot_json || {};
  const amountCents = snap.grand_total_cents ?? details?.amount;
  const currency = snap.currency || order?.currency || details?.currency;

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white border border-[#EBE9E4] w-full max-w-md"
      >
        {status === "verifying" && (
          <div className="px-6 sm:px-8 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-6 border-2 border-[#EBE9E4] border-t-[#1C1C1A] rounded-full animate-spin" />
            <h1 className="text-xl font-light tracking-wide text-[#1C1C1A]">
              Confirming your payment
            </h1>
            <p className="text-sm text-[#8C8C86] mt-2 max-w-xs mx-auto">
              This only takes a moment. Please don&apos;t close this window.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="px-6 sm:px-8 py-10 text-center">
            <AnimatedCheckmark size={72} color="#3B5C2E" strokeWidth={5} />

            <h1 className="text-2xl font-light tracking-wide text-[#1C1C1A] mt-6">
              Payment successful
            </h1>
            <p className="text-sm text-[#6B6B64] mt-2 max-w-xs mx-auto font-light">
              Thank you for your purchase. We&apos;ve received your payment and
              your order is now being prepared.
            </p>

            {(amountCents != null || order?.id) && (
              <div className="mt-7 pt-5 border-t border-[#F0EFEA] space-y-2.5 text-sm text-left">
                {order?.id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8C8C86]">Order number</span>
                    <span className="font-mono text-[#1C1C1A] font-medium">
                      {order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                )}
                {typeof amountCents === "number" && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8C8C86]">Amount paid</span>
                    <span className="text-[#1C1C1A] font-medium">
                      {formatPriceFromCents(amountCents, currency || "NGN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-[#8C8C86]">Reference</span>
                  <span className="font-mono text-[#6B6B64] text-xs break-all text-right">
                    {reference}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(orderPath, { replace: true })}
              className="w-full mt-7 bg-[#1C1C1A] text-white py-3 text-sm uppercase tracking-wide hover:bg-black transition-colors"
            >
              View your order
            </button>
            <p className="text-xs text-[#8C8C86] mt-3">
              {isAuthenticated
                ? `Redirecting to your orders in ${countdown}s`
                : `Redirecting to your order in ${countdown}s`}
            </p>
          </div>
        )}

        {status === "cancelled" && (
          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="w-16 h-16 mx-auto bg-[#F5F0E8] rounded-full flex items-center justify-center">
              <FiAlertCircle className="text-[#8B6B3D] text-2xl" />
            </div>
            <h1 className="text-2xl font-light tracking-wide text-[#1C1C1A] mt-6">
              Payment not completed
            </h1>
            <p className="text-sm text-[#6B6B64] mt-2 max-w-xs mx-auto font-light">
              Your payment was cancelled or didn&apos;t go through, so no order
              was placed. Your bag is still saved — you can pick up right where
              you left off.
            </p>

            {reference && (
              <p className="text-xs text-[#8C8C86] mt-4 font-mono break-all">
                Ref: {reference}
              </p>
            )}

            <div className="mt-7 space-y-2.5">
              <button
                onClick={() => navigate("/checkout", { replace: true })}
                className="w-full bg-[#1C1C1A] text-white py-3 text-sm uppercase tracking-wide hover:bg-black transition-colors"
              >
                Return to checkout
              </button>
              <Link
                to="/cart"
                replace
                className="block w-full py-3 text-sm text-[#8C8C86] hover:text-[#1C1C1A] transition-colors underline underline-offset-4"
              >
                Back to bag
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="w-16 h-16 mx-auto bg-[#F5E8E8] rounded-full flex items-center justify-center">
              <FiX className="text-[#8B3D3D] text-2xl" />
            </div>
            <h1 className="text-2xl font-light tracking-wide text-[#1C1C1A] mt-6">
              Payment not confirmed
            </h1>
            <p className="text-sm text-[#6B6B64] mt-2 max-w-xs mx-auto font-light">
              {errorMessage}
            </p>

            {reference && (
              <p className="text-xs text-[#8C8C86] mt-4 font-mono break-all">
                Ref: {reference}
              </p>
            )}

            <p className="text-xs text-[#8C8C86] mt-4 max-w-xs mx-auto">
              If you were charged, don&apos;t pay again — quote the reference
              above to our team and we&apos;ll sort it out.
            </p>

            <div className="mt-7 space-y-2.5">
              <button
                onClick={verifyPayment}
                className="w-full border border-[#1C1C1A] py-3 text-sm uppercase tracking-wide hover:bg-[#1C1C1A] hover:text-white transition-colors"
              >
                Try again
              </button>
              <Link
                to={orderPath}
                replace
                className="block w-full py-3 text-sm text-[#8C8C86] hover:text-[#1C1C1A] transition-colors underline underline-offset-4"
              >
                {isAuthenticated ? "Go to your orders" : "Check your order"}
              </Link>
            </div>
          </div>
        )}

        {status === "missing" && (
          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="w-16 h-16 mx-auto bg-[#F5F0E8] rounded-full flex items-center justify-center">
              <FiAlertCircle className="text-[#8B6B3D] text-2xl" />
            </div>
            <h1 className="text-2xl font-light tracking-wide text-[#1C1C1A] mt-6">
              Nothing to confirm
            </h1>
            <p className="text-sm text-[#6B6B64] mt-2 max-w-xs mx-auto font-light">
              We couldn&apos;t find a payment reference in this link.{" "}
              {isAuthenticated
                ? "If you just paid, your order will still show up under your orders."
                : "If you just paid, check the confirmation email for your order link."}
            </p>
            <Link
              to={isAuthenticated ? "/orders" : "/product"}
              replace
              className="inline-block w-full mt-7 bg-[#1C1C1A] text-white py-3 text-sm uppercase tracking-wide hover:bg-black transition-colors"
            >
              {isAuthenticated ? "Go to your orders" : "Continue shopping"}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentCallback;
