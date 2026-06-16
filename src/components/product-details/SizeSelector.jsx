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
    <div className="mt-10">
      <h2 className="text-sm font-medium text-gray-900">Size</h2>
      <div className="grid grid-cols-5 gap-3 mt-2">
        {sizes.map((size) => {
          const isAvailable = isSizeAvailable(size);
          const isSelected = selectedSize === size;
          const combinationUnavailable =
            selectedColor && !isVariantAvailable(selectedColor, size);
          return (
            <button
              key={size}
              className={`border py-3 px-4 text-sm font-normal transition-all ${
                isSelected
                  ? "border-black bg-transparent text-black"
                  : !isAvailable || combinationUnavailable
                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
              }`}
              onClick={() =>
                isAvailable && !combinationUnavailable && onSelect(size)
              }
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
