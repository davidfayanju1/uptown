import React from "react";

const SizeSelector = ({
  sizes,
  selectedSize,
  selectedColor,
  isSizeAvailable,
  isVariantAvailable,
  onSelect,
}) => {
  if (sizes[0] === "" || sizes.length === 0) return null;

  return (
    <div className="mt-[1.5rem]">
      <h2 className="font-now text-[0.9375rem] font-bold text-gray-900">Size</h2>
      <div className="flex flex-wrap mt-[0.75rem]">
        {sizes.map((size) => {
          const isAvailable = isSizeAvailable(size);
          const isSelected = selectedSize === size;
          const combinationUnavailable =
            selectedColor && !isVariantAvailable(selectedColor, size);
          const disabled = !isAvailable || combinationUnavailable;

          return (
            <button
              key={size}
              aria-pressed={isSelected}
              className={`min-w-[4.25rem] py-[0.9375rem] px-[1.25rem] font-now text-[0.9375rem] transition-all ${
                isSelected
                  ? "border-2 border-black bg-white text-gray-900 relative z-10"
                  : disabled
                    ? "border border-transparent bg-[#f2f2f2] text-gray-300 cursor-not-allowed"
                    : "border border-transparent bg-[#f2f2f2] text-gray-700 hover:bg-[#e8e8e8]"
              }`}
              onClick={() => !disabled && onSelect(size)}
              disabled={disabled}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;
