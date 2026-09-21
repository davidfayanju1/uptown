// components/checkout/GatewayReturnRedirect.jsx — a gateway whose redirect URL
// points anywhere but /payment/callback (Flutterwave's is configured
// server-side and currently lands on the site root) still tags the URL with
// its own parameters. Wherever that lands, hand it to the callback page,
// which owns verification and the order screen.
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CALLBACK_PATH = "/payment/callback";

// Interswitch: txnref · Paystack: trxref · Flutterwave: tx_ref, transaction_id
const GATEWAY_PARAMS = ["txnref", "trxref", "tx_ref", "transaction_id"];

const GatewayReturnRedirect = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === CALLBACK_PATH) return;
    const params = new URLSearchParams(search);
    if (!GATEWAY_PARAMS.some((key) => params.has(key))) return;
    navigate(`${CALLBACK_PATH}${search}`, { replace: true });
  }, [pathname, search, navigate]);

  return null;
};

export default GatewayReturnRedirect;
