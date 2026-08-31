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
      className="flex items-center gap-[10px] cursor-pointer"
    >
      <span
        className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-gray-900" : "border-gray-300"
        }`}
      >
        {checked && (
          <span className="h-[8px] w-[8px] rounded-full bg-gray-900" />
        )}
      </span>
      <span className="text-[13.8px] text-gray-900 leading-none">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-now">
      <div className="px-4 pt-[22px]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="block p-1 -ml-1 cursor-pointer"
        >
          <IoChevronBack size={22} />
        </button>
        <h1 className="mt-[18px] mb-[26px] text-[19.6px] leading-none">
          Include a Gift Message
        </h1>
      </div>

      <div className="h-[204px] w-full bg-[#F6F5F3] flex items-center justify-center overflow-hidden">
        <img
          src="/images/gift-message.jpg"
          alt="Daily Project gift packaging"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex-1 px-5 pt-[31px] pb-8">
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
          className="mt-[8px] w-full h-[123px] resize-none border border-gray-200 p-4 text-[13.1px] leading-relaxed text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:opacity-60"
        />
        <p className="mt-[3px] text-[9.2px] text-gray-900">
          {linesLeft} line(s) left
        </p>

        <div className="mt-[24px]">
          <Toggle
            checked={hidePrice}
            onChange={setHidePrice}
            label="Hide price on Invoice"
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white px-[14px] py-4">
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full h-[42px] text-[12.8px] text-white transition-colors ${
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
