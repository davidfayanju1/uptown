import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const GATEWAY_RETURN_FLAG = "returned-from-payment-gateway";

// Call before handing the shopper off to the gateway's hosted page.
export const markGatewayHandoff = () => {
  sessionStorage.setItem(GATEWAY_RETURN_FLAG, "1");
};

/**
 * Leaving for the gateway is a full-page POST, so its pages become real
 * cross-origin entries in the browser history — sitting between checkout and
 * wherever the shopper lands afterwards. Those entries can't be removed, and a
 * Back press that targets them is a cross-origin navigation we get no say in.
 *
 * Pushing a same-document entry changes that: the next Back fires `popstate`
 * here, which we can intercept, instead of leaving the site for a payment page
 * that expired the moment the transaction ended.
 *
 * The guard arms once per gateway round trip — it consumes the flag on install,
 * so it only affects the first page after the callback and never traps ordinary
 * browsing.
 */
export const useGatewayBackGuard = (fallbackPath) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(GATEWAY_RETURN_FLAG) !== "1") return;
    sessionStorage.removeItem(GATEWAY_RETURN_FLAG);

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      navigate(fallbackPath, { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, fallbackPath]);
};
