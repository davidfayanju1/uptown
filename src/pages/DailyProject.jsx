// pages/DailyProject.jsx - Shop DAILYPROJECT collection
import React, { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PrimaryLayout from "../layout/PrimaryLayout";

// No backend for this collection yet. Shaped like the products API response so
// swapping in a fetch later only means replacing this constant.
const DAILY_PROJECT_PRODUCTS = [
  {
    id: "dp-hm",
    name: "Daily Project H&M",
    price: "$960",
    images: ["/images/product5.jpg", "/images/hero5.jpeg"],
  },
  {
    id: "dp-core",
    name: "Daily Projecr",
    price: "$1,625",
    images: ["/images/victory1.jpeg", "/images/victory2.jpeg"],
  },
  {
    id: "dp-cds",
    name: "C.D.S. crewneck sweater",
    price: "$1,575",
    images: ["/images/Reality.PNG", "/images/Reality-2.png", "/images/hero_2.PNG"],
  },
  {
    id: "dp-polo",
    name: '"Piqures seller" polo shirt',
    price: "$770",
    images: ["/images/hero5.jpeg", "/images/product5.jpg"],
  },
];

// Native scroll-snap carousel — gives real touch swipe without a library, and
// the dots read their state back off the scroll position.
const ProductImages = ({ product }) => {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive((prev) => (prev === index ? prev : index));
  }, []);

  const goTo = (index) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#1c1c1c]">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto no-scrollbar"
      >
        {product.images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${product.name} ${i + 1}`}
            className="h-full w-full flex-shrink-0 snap-center object-cover"
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>

      {product.images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {product.images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                // the card is a link — keep the dot from navigating
                e.preventDefault();
                goTo(i);
              }}
              aria-label={`Image ${i + 1} of ${product.images.length}`}
              className={`rounded-full transition-all ${
                i === active
                  ? "h-2 w-2 bg-white"
                  : "h-1.5 w-1.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DailyProject = () => {
  return (
    <PrimaryLayout>
      <div className="min-h-screen bg-[#282727]">
        <div className="md:mt-[5rem] mt-[4rem] pt-10 pb-16">
          <h1 className="flex items-center gap-3 mb-8 px-4">
            <span className="text-white text-[1.75rem] font-now font-normal leading-none">
              Shop
            </span>
            <img
              src="/images/dailyproject-red.png"
              alt="DAILYPROJECT™"
              className="block h-auto w-[10.5rem]"
            />
          </h1>

          <div className="grid grid-cols-2 gap-x-[0.2rem] gap-y-8 px-[0.2rem]">
            {DAILY_PROJECT_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group block w-full"
              >
                <ProductImages product={product} />
                <h3 className="mt-4 px-1 text-[15px] text-white font-now">
                  {product.name}
                </h3>
                <p className="mt-2 px-1 text-[15px] text-white font-now">
                  {product.price}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default DailyProject;
