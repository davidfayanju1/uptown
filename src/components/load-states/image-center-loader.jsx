import React from "react";

const ImageLoader = () => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="animate-pulse-center">
        <img
          src="/images/logo-white.png"
          alt="Loading..."
          className="w-60 h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default ImageLoader;
