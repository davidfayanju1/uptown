import React, { useState, useEffect } from "react";
import { IoChevronForward, IoClose } from "react-icons/io5";

const POLICIES = [
  {
    id: "payment",
    title: "Payment",
    preview:
      "Securely processed by Interswitch. Pay with debit or credit cards, bank transfer, USSD, QR and other supported payment methods.",
    panelTitle: "Payment",
    content: (
      <>
        <p>All payments are securely processed by Interswitch.</p>
        <p>We accept:</p>
        <ul>
          <li>Debit and credit cards (Verve, Visa, Mastercard).</li>
          <li>Bank transfer.</li>
          <li>USSD.</li>
          <li>QR and other supported payment methods.</li>
        </ul>
        <p>
          Your card and bank details are encrypted and handled directly by
          Interswitch. We never see or store your payment information.
        </p>
        <p>
          All prices are shown in Nigerian Naira (&#8358;) and include applicable
          taxes.
        </p>
        <p>
          Your order is confirmed only after payment has been successfully
          authorised. If a payment fails or is declined, no order is created and
          any amount held by your bank is released automatically.
        </p>
        <img
          src="/images/interswitch-powered.png"
          alt="Powered by Interswitch"
          className="mt-8 mx-auto h-auto w-[220px] max-w-full object-contain"
        />
      </>
    ),
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    preview:
      "Complimentary standard delivery on Nigerian orders above ₦150,000.",
    panelTitle: "Shipping & Delivery",
    content: (
      <>
        <p>All deliveries are handled by Fez Delivery.</p>
        <p>
          Orders are typically processed within 24&ndash;36 hours (excluding
          weekends and public holidays). Once your order has been processed,
          you&rsquo;ll receive a shipping confirmation email with your delivery
          details.
        </p>
        <p>
          Shipping time begins after you receive your shipping confirmation
          email.
        </p>
        <p>Delivery Estimates</p>
        <ul>
          <li>Lagos: 1&ndash;3 business days</li>
          <li>Other Nigerian States: 2&ndash;7 business days</li>
        </ul>
        <p>
          Delivery times may vary during product launches, holidays or
          unforeseen courier delays.
        </p>
        <p>
          Complimentary standard delivery is available on qualifying orders.
        </p>
      </>
    ),
  },
  {
    id: "returns",
    title: "Returns & Exchanges",
    preview: "Returns and exchanges accepted within 14 days for eligible items.",
    panelTitle: "Return & Exchange",
    content: (
      <>
        <p>We want you to be completely satisfied with your purchase.</p>
        <p>
          Eligible items may be returned or exchanged within 14 days of
          delivery.
        </p>
        <p>To qualify, items must:</p>
        <ul>
          <li>Be unworn and unwashed.</li>
          <li>Be in their original condition.</li>
          <li>Include all original packaging, tags, certificates and accessories.</li>
          <li>Show no signs of wear, damage or alteration.</li>
        </ul>
        <p>Returns or exchanges cannot be accepted for:</p>
        <ul>
          <li>Items marked Final Sale.</li>
          <li>Products that have been worn, washed or damaged after delivery.</li>
          <li>Gift cards or digital products.</li>
        </ul>
        <p>
          If you receive an incorrect or defective item, please contact us
          within 48 hours of receiving your order so we can resolve the issue
          promptly.
        </p>
        <p>Once your return is approved and inspected:</p>
        <ul>
          <li>Exchanges are processed subject to product availability.</li>
          <li>
            Refunds are issued to your original payment method where applicable
            and may take 5&ndash;10 business days to appear, depending on your
            bank.
          </li>
        </ul>
        <p>
          Customers are responsible for return shipping costs unless the item
          received was incorrect or defective.
        </p>
      </>
    ),
  },
];

const ProductPolicies = () => {
  const [openId, setOpenId] = useState(null);
  const active = POLICIES.find((p) => p.id === openId);

  useEffect(() => {
    if (!openId) return;
    const onKeyDown = (e) => e.key === "Escape" && setOpenId(null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openId]);

  return (
    <>
      <div className="mt-10 bg-[#f4f4f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-gray-300">
          {POLICIES.map((policy) => (
            <button
              key={policy.id}
              type="button"
              onClick={() => setOpenId(policy.id)}
              className="group w-full flex items-center gap-4 pt-6 pb-3 text-left"
            >
              <span className="flex-1">
                <span className="block text-[14px] font-bold tracking-tight text-gray-900">
                  {policy.title}
                </span>
                <span className="mt-1 block font-now font-normal text-[12px] leading-relaxed text-gray-500">
                  {policy.preview}
                </span>
              </span>
              <IoChevronForward
                size={20}
                className="flex-shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenId(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.panelTitle}
            className="relative w-full max-h-[85vh] overflow-y-auto bg-white shadow-2xl animate-policy-slide-up"
          >
            <div className="sticky top-0 flex items-center gap-4 bg-white px-4 sm:px-6 lg:px-8 pt-6 pb-4">
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close"
                className="text-gray-900 hover:opacity-60 transition-opacity"
              >
                <IoClose size={28} />
              </button>
              <h2 className="flex-1 pr-10 text-center text-base font-bold tracking-tight text-gray-900">
                {active.panelTitle}
              </h2>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 pb-10 max-w-3xl mx-auto text-[14px] leading-relaxed text-gray-700 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-2 [&_li]:mb-1">
              {active.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPolicies;
