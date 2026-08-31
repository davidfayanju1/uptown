// pages/DailyProject.jsx - Shop DAILYPROJECT collection
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PrimaryLayout from "../layout/PrimaryLayout";
import api from "../lib/axios";
import { getProductPrice } from "../utils/currency";

const PRODUCT_TYPE = "Daily_Project";

// Same shape Product.jsx uses, but the card swipes so it keeps every image
// rather than just the first.
const transformProductData = (apiProducts) =>
  apiProducts.map((product) => {
    const variants = product.variants || [];
    const { formatted: price } = getProductPrice(variants);

    // Variant imagery first, falling back to the product's own
    const images = [
      ...new Set([
        ...variants.flatMap((variant) => variant.images || []),
        ...(product.images || []),
      ]),
    ];

    return {
      id: product.id,
      name: product.title,
      price,
      images: images.length ? images : ["/images/placeholder.png"],
      available: variants.some((variant) => variant.stock > 0),
    };
  });

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchDailyProject = async () => {
      setLoading(true);
      try {
        // Filter is a query param, not a body — the backend expects it here
        const response = await api.get("/v1/products", {
          params: { product_type: PRODUCT_TYPE },
        });
        if (!cancelled && response.data?.status && response.data?.data) {
          setProducts(transformProductData(response.data.data));
        }
      } catch (error) {
        console.log(error, "fetching daily project products error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDailyProject();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PrimaryLayout>
      <div className="min-h-screen bg-[#282727]">
        <div className="md:mt-[5rem] mt-[4rem] pt-10 pb-16">
          <h1 className="flex items-center gap-3 mb-8 px-4">
            <span className="text-white text-[21px] font-now font-normal leading-none">
              Shop
            </span>
            <img
              src="/images/dailyproject-red.png"
              alt="DAILYPROJECT™"
              className="block h-auto w-[10.5rem]"
            />
          </h1>

          {loading && (
            <div className="grid grid-cols-2 gap-x-[0.2rem] gap-y-8 px-[0.2rem]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-full animate-pulse">
                  <div className="w-full aspect-[3/4] bg-white/10" />
                  <div className="mt-4 mx-1 h-4 w-3/4 bg-white/10" />
                  <div className="mt-2 mx-1 h-4 w-1/3 bg-white/10" />
                </div>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <p className="px-4 py-12 text-center text-white/60 font-now">
              No pieces in this collection yet.
            </p>
          )}

          {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-x-[0.2rem] gap-y-8 px-[0.2rem]">
            {products.map((product) => (
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
          )}
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default DailyProject;
