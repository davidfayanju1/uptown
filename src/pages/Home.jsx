import React, { useState, useEffect, useRef } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressInterval = useRef(null);
  const progressRef = useRef(null);
  const videoRefs = useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
  ]);

  // Slide data - you can customize this as needed
  const slides = [
    {
      title: "Premium Craftsmanship",
      text: "A statement piece, not an everyday cap. Crafted with precision. Released in rarity.",
      buttonText: "Explore",
      buttonClass:
        "rounded-full text-black cursor-pointer w-[10rem] bg-white border-none outline-none px-2 py-3 flex items-center justify-center text-[.9rem] hover:bg-gray-100 transition-colors",
      mediaType: "image",
      mediaSrc: "/images/hero5.jpg",
    },
    {
      title: "Exclusive Designs",
      text: "Limited edition headwear for the discerning collector. Each piece tells a story.",
      buttonText: "Discover",
      buttonClass:
        "rounded-md text-white cursor-pointer w-[10rem] bg-transparent border-2 border-white outline-none px-2 py-3 flex items-center justify-center text-[.9rem] hover:bg-white/10 transition-colors",
      mediaType: "video",
      mediaSrc: "/images/video.mp4", // Replace with your video path
    },
    {
      title: "Timeless Style",
      text: "Where heritage meets contemporary design. For those who appreciate the finer details.",
      buttonText: "Shop Now",
      buttonClass:
        "rounded-none text-white cursor-pointer w-[10rem] bg-black border border-white outline-none px-2 py-3 flex items-center justify-center text-[.9rem] hover:bg-white hover:text-black transition-colors",
      mediaType: "image",
      mediaSrc: "/images/slider1.jpeg", // Replace with your image path
    },
  ];

  // Handle slide progression
  useEffect(() => {
    if (isPlaying) {
      // Reset progress animation
      if (progressRef.current) {
        progressRef.current.style.animation = "none";
        progressRef.current.offsetHeight; // Trigger reflow
        progressRef.current.style.animation = "progress 7s linear forwards";
      }

      progressInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 7000); // 7 seconds for each slide
    } else {
      clearInterval(progressInterval.current);
      // Pause progress animation
      if (progressRef.current) {
        progressRef.current.style.animationPlayState = "paused";
      }
    }

    return () => clearInterval(progressInterval.current);
  }, [isPlaying, slides.length, currentSlide]);

  // Handle video playback based on slide
  useEffect(() => {
    slides.forEach((slide, index) => {
      if (slide.mediaType === "video" && videoRefs.current[index].current) {
        if (index === currentSlide && isPlaying) {
          videoRefs.current[index].current.play();
        } else {
          videoRefs.current[index].current.pause();
        }
      }
    });
  }, [currentSlide, isPlaying, slides]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPlaying(true);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPlaying(true);
  };

  return (
    <PrimaryLayout>
      <div className="page-container bg-black overflow-hidden mt-[5.6rem] md:min-h-[40rem] relative">
        {/* Slider container */}
        <div className="slider-container relative w-full h-[77vh] md:h-[40rem] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Media content - now full screen */}
              <div className="media-container h-full w-full">
                {slide.mediaType === "image" ? (
                  <img
                    src={slide.mediaSrc}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRefs.current[index]}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={slide.mediaSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Text overlay */}
              <div className="text-container absolute inset-0 bg-black/40 h-full w-full flex flex-col items-center justify-center px-4">
                <h2 className="text-white md:text-5xl text-3xl font-bold mb-4 text-center animate-fade-in">
                  {slide.title}
                </h2>
                <p className="block md:text-xl text-lg mx-auto text-center md:w-[50%] w-full text-white mb-8 animate-fade-in-delayed">
                  {slide.text}
                </p>
                <button
                  onClick={() => navigate("/explore")}
                  className={
                    slide.buttonClass + " animate-fade-in-more-delayed"
                  }
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>
          ))}

          {/* Indicators and controls - moved to bottom right */}
          <div className="absolute bottom-6 right-6 flex items-center space-x-4 z-20 bg-black/30 rounded-full pl-4 pr-2 py-2">
            {/* Navigation arrows - now beside play/pause */}
            <button
              onClick={prevSlide}
              className="text-white p-2 rounded-full hover:bg-black/50 transition-colors"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="text-white p-2 rounded-full hover:bg-black/50 transition-colors"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Slide indicators */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-white scale-125"
                      : "bg-gray-500 hover:bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause button with progress indicator */}
            <div className="relative">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="#4A4A4A"
                  strokeWidth="2"
                />
                <circle
                  ref={progressRef}
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  style={{
                    animation: isPlaying
                      ? "progress 7s linear forwards"
                      : "none",
                  }}
                />
              </svg>
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center text-white"
                aria-label={isPlaying ? "Pause slider" : "Play slider"}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes progress {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-fade-in-more-delayed {
          animation: fade-in 1s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </PrimaryLayout>
  );
};

export default Home;
