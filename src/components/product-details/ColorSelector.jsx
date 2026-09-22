import React from "react";

const ColorSelector = ({
  colors,
  selectedColor,
  isColorAvailable,
  onSelect,
}) => {
  if (colors.length === 0) return null;

  return (
    <div className="mt-[1.5rem]">
      <h2 className="font-now text-[0.9375rem] font-bold text-gray-900">
        Colour{selectedColor ? `: ${selectedColor}` : ""}
      </h2>
      <div className="flex mt-[0.75rem] flex-wrap gap-[0.75rem]">
        {colors.map((color) => {
          const isAvailable = isColorAvailable(color);
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              className={`relative w-[4.25rem] h-[2.25rem] border transition-all ${
                isSelected
                  ? "border-black border-2"
                  : "border-gray-200 hover:border-gray-400"
              } ${!isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              style={{ backgroundColor: color.toLowerCase() }}
              title={!isAvailable ? "Out of stock" : color}
              aria-label={color}
              aria-pressed={isSelected}
              onClick={() => isAvailable && onSelect(color)}
              disabled={!isAvailable}
            >
              {!isAvailable && (
                <svg
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                >
                  <line
                    x1="0"
                    y1="40"
                    x2="100"
                    y2="0"
                    stroke="#ef4444"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;
