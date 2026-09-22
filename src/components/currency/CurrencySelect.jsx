// components/currency/CurrencySelect.jsx — the region/currency dropdown shared
// by the welcome screen (light, on the photo) and the account page (dark).
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoCaretDown } from "react-icons/io5";
import { CURRENCY_OPTIONS, getCurrencyOption } from "../../domain/currency";

const VARIANTS = {
  light: {
    trigger: "border-white/90 text-white",
    menu: "bg-white text-[#1C1C1A]",
  },
  dark: {
    trigger: "border-[#1C1C1A] text-[#1C1C1A]",
    menu: "bg-white text-[#1C1C1A] border border-[#E5E2DC]",
  },
};

const CurrencySelect = ({
  value,
  onChange,
  variant = "light",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const styles = VARIANTS[variant];
  const selected = getCurrencyOption(value);

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
    onChange(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`relative w-full border px-12 py-4 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-center transition-colors ${styles.trigger}`}
      >
        {selected.label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-5 top-1/2 -translate-y-1/2 flex"
        >
          <IoCaretDown size="0.875rem" />
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
            className={`absolute left-0 right-0 top-full mt-2 z-20 shadow-lg ${styles.menu}`}
          >
            {CURRENCY_OPTIONS.map((option) => {
              const isSelected = option.code === value;
              return (
                <li
                  key={option.code}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    onClick={() => choose(option.code)}
                    className={`w-full px-5 py-4 text-[0.75rem] uppercase tracking-[0.08em] text-center transition-colors hover:bg-[#F7F5F2] ${
                      isSelected ? "bg-[#F7F5F2] font-medium" : ""
                    }`}
                  >
                    {option.label}
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

export default CurrencySelect;
