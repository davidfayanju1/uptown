import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
const SPRING = { type: "spring", stiffness: 280, damping: 28, mass: 0.9 };

const ProductImageGallery = ({
  images,
  productName,
  currentSlideIndex,
  onSlideChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const sliderRef = useRef(null);
  const thumbnailContainerRef = useRef(null);

  // Single motion value owns the x position — Framer Motion mutates it
  // directly during drag and we animate it imperatively on slide change.
  const x = useMotionValue(0);

  // Progress bar derived from x with zero re-renders
  const progressPercent = useTransform(x, (latest) => {
    if (images.length <= 1 || containerWidth === 0) return "0%";
    const total = (images.length - 1) * containerWidth;
    const clamped = Math.max(-total, Math.min(0, latest));
    return `${(-clamped / total) * 100}%`;
  });

  // Measure the container once and on resize; snap x when width changes
  useEffect(() => {
    const measure = () => {
      const w = sliderRef.current?.offsetWidth;
      if (!w) return;
      setContainerWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (sliderRef.current) ro.observe(sliderRef.current);
    return () => ro.disconnect();
  }, []);

  // When the container width changes snap to current index without animating
  // (resize / orientation flip — users don't notice a snap here)
  useEffect(() => {
    if (containerWidth === 0) return;
    x.set(-(currentSlideIndex * containerWidth));
  }, [containerWidth]);

  // Smooth spring to the right slide whenever the index changes from outside
  // (thumbnail click, colour-select jump, etc.)
  useEffect(() => {
    if (containerWidth === 0) return;
    const controls = animate(x, -(currentSlideIndex * containerWidth), SPRING);
    return controls.stop;
  }, [currentSlideIndex, containerWidth]);

  const snapTo = (index) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    animate(x, -(clamped * containerWidth), SPRING);
    if (clamped !== currentSlideIndex) onSlideChange(clamped);
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    if (containerWidth === 0) return;

    // Nearest slide from current position
    const nearest = Math.round(-x.get() / containerWidth);

    // Override nearest with velocity flick (> 400 px/s goes one further)
    let target = Math.max(0, Math.min(nearest, images.length - 1));
    if (info.velocity.x < -400) target = Math.min(nearest + 1, images.length - 1);
    else if (info.velocity.x > 400) target = Math.max(nearest - 1, 0);

    snapTo(target);
  };

  return (
    <div className="lg:w-1/2 w-full self-start">
      {/* ── Mobile swipeable slider ── */}
      <div
        ref={sliderRef}
        className="relative mb-4 lg:hidden h-[85vh] md:h-[90vh] w-screen left-1/2 -translate-x-1/2 -mt-16 overflow-hidden bg-gray-100 select-none"
        style={{ touchAction: "pan-y" }}
      >
        <motion.div
          className="flex h-full"
          style={{
            x,
            width: `${images.length * 100}%`,
            cursor: isDragging ? "grabbing" : "grab",
            willChange: "transform",
          }}
          drag={images.length > 1 ? "x" : false}
          dragConstraints={{
            left: -(images.length - 1) * containerWidth,
            right: 0,
          }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          {images.map((img, index) => (
            <div
              key={`${img}-${index}`}
              className="h-full flex-shrink-0"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                src={img}
                alt={`${productName} view ${index + 1}`}
                className="h-full w-full object-cover object-center"
                draggable={false}
              />
            </div>
          ))}
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-transparent pointer-events-none z-10" />

        {/* Progress bar — follows x with zero re-renders */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/25 z-20">
            <motion.div className="h-full bg-black" style={{ width: progressPercent }} />
          </div>
        )}

        {/* Floating thumbnail strip — overlaid on the bottom of the main image */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 z-30 pl-6 pr-4">
            <div
              ref={thumbnailContainerRef}
              className="flex gap-2 overflow-x-auto pb-1 scroll-smooth snap-x scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => snapTo(index)}
                  className={`relative h-[72px] w-[72px] flex-shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-200 ${
                    currentSlideIndex === index ? "" : "opacity-90"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${productName} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop stacked images ── */}
      <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:w-full">
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            className="w-full h-screen overflow-hidden bg-gray-100"
          >
            <img
              src={img}
              alt={`${productName} view ${index + 1}`}
              className="w-full h-full object-cover object-center"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
