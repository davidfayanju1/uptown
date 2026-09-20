// components/currency/CurrencyGate.jsx — the welcome screen a first-time
// visitor sees before anything else. App renders it in place of the routes
// until a currency has been confirmed, so nothing is fetched in the wrong one.
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCurrency } from "../../hooks/useCurrency";
import CurrencySelect from "./CurrencySelect";

const BACKGROUND_IMAGE = "/images/currency-gate.jpg";

const CurrencyGate = () => {
  const { currency, setCurrency } = useCurrency();
  const [choice, setChoice] = useState(currency);

  return (
    <div
      className="relative min-h-dvh flex flex-col justify-center px-6 sm:px-8 py-16 bg-[#1C1C1A] bg-cover bg-center font-now text-white"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
    >
      <div className="absolute inset-0 bg-black/35" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-auto"
      >
        <h1 className="text-[20px] text-center">Welcome to Uptown</h1>
        <p className="text-[11px] text-center text-white/90 leading-relaxed mt-6 mx-auto max-w-[320px]">
          Please confirm your shipping location to continue to our online
          store.
        </p>

        <CurrencySelect
          value={choice}
          onChange={setChoice}
          className="mt-9"
        />

        <button
          type="button"
          onClick={() => setCurrency(choice)}
          className="w-full mt-6 py-[15px] bg-white text-[#1C1C1A] text-[11px] font-semibold uppercase tracking-[0.08em] hover:bg-[#F7F5F2] transition-colors"
        >
          Confirm shipping location
        </button>
      </motion.div>
    </div>
  );
};

export default CurrencyGate;
