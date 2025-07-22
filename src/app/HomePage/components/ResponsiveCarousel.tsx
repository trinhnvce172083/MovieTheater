"use client";

import React, { useState, useRef, memo, useCallback, useEffect } from "react";
import { Carousel as AntCarousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResponsiveCarouselProps {
  children: React.ReactNode;
  autoplay?: boolean;
  effect?: "scrollx" | "fade";
  [x: string]: unknown;
}

const ResponsiveCarousel = memo(function ResponsiveCarousel({
  children,
  autoplay = true,
  effect = "fade",
  ...rest
}: ResponsiveCarouselProps) {
  const carouselRef = useRef<CarouselRef>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const childrenArray = React.Children.toArray(children);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePrev = useCallback(() => {
    carouselRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    carouselRef.current?.next();
  }, []);

  const afterChange = useCallback((current: number) => {
    setCurrentSlide(current);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsPaused(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsPaused(false);
    }
  }, [isMobile]);

  return (
    <div
      className="relative w-full group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AntCarousel
        ref={carouselRef}
        autoplay={autoplay && !isPaused}
        effect={effect}
        afterChange={afterChange}
        dots={false}
        infinite
        speed={500}
        autoplaySpeed={4000}
        {...rest}
      >
        {childrenArray.map((child, index) => (
          <div key={`carousel-slide-${index}`}>{child}</div>
        ))}
      </AntCarousel>

      {/* Navigation Buttons - Hidden on mobile */}
      {!isMobile && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 
                     bg-black/50 hover:bg-black/70 text-white p-2 rounded-full 
                     transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 
                     bg-black/50 hover:bg-black/70 text-white p-2 rounded-full 
                     transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
        {childrenArray.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => carouselRef.current?.goTo(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

export default ResponsiveCarousel;
