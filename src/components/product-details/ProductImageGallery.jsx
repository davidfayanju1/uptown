import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const ProductImageGallery = ({
  images,
  productName,
  currentSlideIndex,
  onSlideChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sliderContainerRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const dragStartX = useRef(0);
  const isSwiping = useRef(false);

  // ---- Touch handlers ----
  const handleTouchStart = (e) => {
    isSwiping.current = true;
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping.current) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    const containerWidth = sliderContainerRef.current?.offsetWidth || 400;
    let translateX = deltaX;
    if (
      (currentSlideIndex === 0 && deltaX > 0) ||
      (currentSlideIndex === images.length - 1 && deltaX < 0)
    ) {
      translateX = deltaX * 0.35;
    }
    setDragDistance(translateX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) {
      resetDrag();
      return;
    }
    const containerWidth = sliderContainerRef.current?.offsetWidth || 400;
    const threshold = containerWidth * 0.15;
    if (dragDistance > threshold && currentSlideIndex > 0)
      onSlideChange(currentSlideIndex - 1);
    else if (dragDistance < -threshold && currentSlideIndex < images.length - 1)
      onSlideChange(currentSlideIndex + 1);
    setDragDistance(0);
    isSwiping.current = false;
    setIsDragging(false);
  };

  // ---- Mouse handlers ----
  const handleMouseDown = (e) => {
    isSwiping.current = true;
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwiping.current) return;
    const deltaX = e.clientX - dragStartX.current;
    let translateX = deltaX;
    if (
      (currentSlideIndex === 0 && deltaX > 0) ||
      (currentSlideIndex === images.length - 1 && deltaX < 0)
    ) {
      translateX = deltaX * 0.35;
    }
    setDragDistance(translateX);
  };

  const handleMouseUp = () => {
    if (!isSwiping.current) {
      resetDrag();
      return;
    }
    const containerWidth = sliderContainerRef.current?.offsetWidth || 400;
    const threshold = containerWidth * 0.15;
    if (dragDistance > threshold && currentSlideIndex > 0)
      onSlideChange(currentSlideIndex - 1);
    else if (dragDistance < -threshold && currentSlideIndex < images.length - 1)
      onSlideChange(currentSlideIndex + 1);
    setDragDistance(0);
    isSwiping.current = false;
    setIsDragging(false);
  };

  const resetDrag = () => {
    setDragDistance(0);
    setIsDragging(false);
    isSwiping.current = false;
  };

  const checkThumbnailOverflow = () => {
    const container = thumbnailContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  const scrollThumbnails = (direction) => {
    thumbnailContainerRef.current?.scrollBy({
      left: direction === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkThumbnailOverflow();
    const container = thumbnailContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkThumbnailOverflow);
      window.addEventListener("resize", checkThumbnailOverflow);
    }
    return () => {
      if (container)
        container.removeEventListener("scroll", checkThumbnailOverflow);
      window.removeEventListener("resize", checkThumbnailOverflow);
    };
  }, [images]);

  const containerWidth = sliderContainerRef.current?.offsetWidth || 1;
  const rawProgress =
    images.length > 1
      ? (currentSlideIndex - dragDistance / containerWidth) /
        (images.length - 1)
      : 0;
  const progressPercent = Math.min(Math.max(rawProgress, 0), 1) * 100;

  return (
    <div className="lg:w-1/2 w-full self-start">
      {/* Mobile swipeable slider */}
      <div
        ref={sliderContainerRef}
        className="relative mb-4 lg:hidden h-[85vh] md:h-[90vh] w-screen left-1/2 -translate-x-1/2 -mt-16 overflow-hidden bg-gray-100 select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          className="flex h-full w-full"
          style={{
            x: `calc(${-currentSlideIndex * 100}% + ${dragDistance}px)`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          transition={
            isDragging
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 38 }
          }
        >
          {images.map((img, index) => (
            <img
              key={`${img}-${index}`}
              src={img}
              alt={`${productName} view ${index + 1}`}
              className="h-full w-full object-cover object-center flex-shrink-0"
              draggable={false}
            />
          ))}
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-transparent pointer-events-none z-10" />

        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/25 z-20">
            <motion.div
              className="h-full bg-black"
              style={{ width: `${progressPercent}%` }}
              transition={
                isDragging
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 38 }
              }
            />
          </div>
        )}
      </div>

      {/* Desktop stacked images */}
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

      {/* Thumbnail carousel */}
      {images.length > 1 && (
        <div className="relative group/thumbs mt-4 px-4 lg:hidden">
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scrollThumbnails("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl hover:bg-gray-50 border border-gray-100 text-black p-1.5 rounded-full transition-colors"
              >
                <IoChevronBack size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          <div
            ref={thumbnailContainerRef}
            className="flex gap-4 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x scrollbar-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {images.map((img, index) => (
              <div
                key={`${img}-${index}`}
                className={`relative h-20 w-20 flex-shrink-0 snap-start cursor-pointer border-2 overflow-hidden transition-all duration-200 hover:opacity-90 ${
                  currentSlideIndex === index
                    ? "border-black scale-[0.98]"
                    : "border-gray-200"
                }`}
                onClick={() => onSlideChange(index)}
              >
                <img
                  src={img}
                  alt={`${productName} view ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scrollThumbnails("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl hover:bg-gray-50 border border-gray-100 text-black p-1.5 rounded-full transition-colors"
              >
                <IoChevronForward size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
