import React from "react";

const ColorSelector = ({ colors, selectedColor, isColorAvailable, onSelect }) => {
  if (colors.length === 0) return null;

  return (
    <div className="md:mt-8 mt-5">
      <h2 className="text-sm font-medium text-gray-900">Colors</h2>
      <div className="flex mt-2 flex-wrap gap-3">
        {colors.map((color) => {
          const isAvailable = isColorAvailable(color);
          const isSelected = selectedColor === color;
          return (
            <div key={color} className="relative">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative ${
                  isSelected ? "ring-2 ring-black ring-offset-2" : ""
                } ${
                  !isAvailable
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:scale-110"
                }`}
                style={{ backgroundColor: color.toLowerCase() }}
                title={!isAvailable ? "Out of stock" : color}
                onClick={() => isAvailable && onSelect(color)}
                disabled={!isAvailable}
              >
                {!isAvailable && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="absolute inset-0 w-full h-full"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="11"
                      stroke="#ef4444"
                      strokeWidth="2"
                      fill="none"
                    />
                    <line
                      x1="4.5"
                      y1="19.5"
                      x2="19.5"
                      y2="4.5"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;
