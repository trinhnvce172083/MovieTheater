"use client";

import React from "react";
import { Carousel as AntCarousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useState, useRef, memo, useCallback, useEffect } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface CarouselProps {
  children: React.ReactNode;
  autoplay?: boolean;
  effect?: "scrollx" | "fade";
  [x: string]: unknown;
}

function ClientCarousel({
  children,
  autoplay = true,
  effect = "fade",
  ...rest
}: CarouselProps) {
  const carouselRef = useRef<CarouselRef>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const childrenArray = React.Children.toArray(children);
  
  const handlePrev = useCallback(() => {
    carouselRef.current?.prev();
  }, []);
  
  const handleNext = useCallback(() => {
    carouselRef.current?.next();
  }, []);

  // Set up a callback for slide changes
  const afterChange = useCallback((current: number) => {
    setCurrentSlide(current);
  }, []);

  // Handle mouse enter/leave for autoplay pausing
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);
  // Apply autoplay pausing effect
  useEffect(() => {
    if (carouselRef.current) {
      if (isPaused) {
        // @ts-expect-error - private API but useful for pausing
        carouselRef.current.slickPause?.();
      } else if (autoplay) {
        // @ts-expect-error - private API but useful for resuming
        carouselRef.current.slickPlay?.();
      }
    }
  }, [isPaused, autoplay]);
  
  // Listen for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div 
      className="relative group rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Carousel */}
      <AntCarousel
        ref={carouselRef}
        autoplay={autoplay}
        autoplaySpeed={5000}
        dots={false}
        pauseOnHover={false}
        arrows={false}
        draggable={true}
        swipeToSlide={true}
        speed={800}
        easing="ease-in-out"
        infinite
        effect={effect}
        afterChange={afterChange}
        {...rest}
        className="!rounded-lg !overflow-hidden"
      >
        {children}
      </AntCarousel>
      
      {/* Overlay gradient for better button visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Navigation buttons with improved styling */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Previous slide"
        type="button"
      >
        <LeftOutlined style={{ fontSize: 20 }} />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Next slide"
        type="button"
      >
        <RightOutlined style={{ fontSize: 20 }} />
      </button>
      
      {/* Dots indicator with better accessibility and design */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {childrenArray.map((_, index) => (
          <button
            key={index}
            onClick={() => carouselRef.current?.goTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all shadow-md ${
              currentSlide === index 
                ? "bg-orange-500 w-6" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentSlide === index ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(ClientCarousel);
