import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const SimilarProducts = ({ items }) => {
  const scrollRef = useRef(null);
  const [thumb, setThumb] = useState({ width: 100, left: 0 });

  const updateThumb = () => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth === 0) return;
    setThumb({
      width: (el.clientWidth / el.scrollWidth) * 100,
      left: (el.scrollLeft / el.scrollWidth) * 100,
    });
  };

  useEffect(() => {
    updateThumb();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);
    return () => {
      el?.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, [items]);

  const scrollByCard = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-base font-bold tracking-tight text-gray-900">
        You may also like
      </h2>

      {/* Scroll progress indicator */}
      <div className="relative mt-3 h-[2px] w-full bg-gray-200">
        <div
          className="absolute top-0 h-full bg-black transition-all duration-150"
          style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }}
        />
      </div>

      <div
        ref={scrollRef}
        className="mt-5 flex gap-4 overflow-x-auto scroll-smooth snap-x scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="group block flex-shrink-0 w-[42%] sm:w-[30%] md:w-[23%] snap-start"
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
            <div className="mt-2">
              <h3 className="text-xs font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              <p className="text-xs font-medium text-[#8f7355] mt-0.5">
                {item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Carousel arrows */}
      <div className="mt-3 flex justify-end gap-3 text-gray-700">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          aria-label="Previous"
          className="hover:text-black transition-colors"
        >
          <IoChevronBack size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("right")}
          aria-label="Next"
          className="hover:text-black transition-colors"
        >
          <IoChevronForward size={18} />
        </button>
      </div>
    </div>
  );
};

export default SimilarProducts;
