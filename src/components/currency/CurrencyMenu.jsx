// components/currency/CurrencyMenu.jsx — the compact header switcher: the
// current code with a caret that opens the three options. Self-contained, so
// the nav only has to place it and pass its text colour.
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoCaretDown, IoCheckmark } from "react-icons/io5";
import { CURRENCY_OPTIONS } from "../../domain/currency";
import { useCurrency } from "../../hooks/useCurrency";

const CurrencyMenu = ({ className = "" }) => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const choose = (code) => {
    setCurrency(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change currency"
        className="h-[2.5rem] flex items-center gap-1 px-1 text-[.75rem] font-medium tracking-[0.08em] whitespace-nowrap cursor-pointer"
      >
        {currency}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          <IoCaretDown size="0.625rem" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white text-[#1C1C1A] shadow-lg border border-gray-100 z-[60] font-now"
          >
            {CURRENCY_OPTIONS.map((option) => {
              const isSelected = option.code === currency;
              return (
                <li key={option.code} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => choose(option.code)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-[0.6875rem] uppercase tracking-[0.08em] text-left transition-colors hover:bg-[#F7F5F2] ${
                      isSelected ? "bg-[#F7F5F2] font-medium" : ""
                    }`}
                  >
                    {option.label}
                    {isSelected && <IoCheckmark size="0.875rem" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencyMenu;
