import React from "react";
import { Link } from "react-router-dom";

const SimilarProducts = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-light tracking-tight mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="group block"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="relative overflow-hidden bg-gray-100 aspect-square">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {!item.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-medium bg-black/80 px-2 py-1">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
