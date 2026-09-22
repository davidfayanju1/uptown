// pages/GiftMessage.jsx - Gifting and packaging: gift message composer
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

const MAX_LINES = 6;

const GiftMessage = () => {
  const navigate = useNavigate();
  const [printMessage, setPrintMessage] = useState(true);
  const [hidePrice, setHidePrice] = useState(false);
  const [message, setMessage] = useState("");

  const usedLines = message ? message.split("\n").length : 0;
  const linesLeft = Math.max(MAX_LINES - usedLines, 0);
  const canConfirm = message.trim().length > 0;

  // Keep the note within the printable line count
  const handleChange = (e) => {
    const lines = e.target.value.split("\n");
    setMessage(
      lines.length > MAX_LINES ? lines.slice(0, MAX_LINES).join("\n") : e.target.value,
    );
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    // No backend field for this yet — hand it back to the cart for now.
    navigate("/cart", { state: { giftMessage: { message, printMessage, hidePrice } } });
  };

  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-[0.625rem] cursor-pointer"
    >
      <span
        className={`flex h-[1.125rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-gray-900" : "border-gray-300"
        }`}
      >
        {checked && (
          <span className="h-[0.5rem] w-[0.5rem] rounded-full bg-gray-900" />
        )}
      </span>
      <span className="text-[0.8625rem] text-gray-900 leading-none">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-now">
      <div className="px-4 pt-[1.375rem]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="block p-1 -ml-1 cursor-pointer"
        >
          <IoChevronBack size="1.375rem" />
        </button>
        <h1 className="mt-[1.125rem] mb-[1.625rem] text-[1.225rem] leading-none">
          Include a Gift Message
        </h1>
      </div>

      <div className="h-[12.75rem] w-full bg-[#F6F5F3] flex items-center justify-center overflow-hidden">
        <img
          src="/images/gift-message.jpg"
          alt="Daily Project gift packaging"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex-1 px-5 pt-[1.9375rem] pb-8">
        <Toggle
          checked={printMessage}
          onChange={setPrintMessage}
          label="Print the Message"
        />

        <textarea
          value={message}
          onChange={handleChange}
          disabled={!printMessage}
          placeholder="Write your note here"
          className="mt-[0.5rem] w-full h-[7.6875rem] resize-none border border-gray-200 p-4 text-[0.81875rem] leading-relaxed text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:opacity-60"
        />
        <p className="mt-[0.1875rem] text-[0.575rem] text-gray-900">
          {linesLeft} line(s) left
        </p>

        <div className="mt-[1.5rem]">
          <Toggle
            checked={hidePrice}
            onChange={setHidePrice}
            label="Hide price on Invoice"
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white px-[0.875rem] py-4">
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full h-[2.625rem] text-[0.8rem] text-white transition-colors ${
            canConfirm
              ? "bg-gray-900 hover:bg-gray-800 cursor-pointer"
              : "bg-[#BCBDBD] cursor-not-allowed"
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default GiftMessage;
