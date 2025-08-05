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
  autoplaySpeed?: number;
  [x: string]: unknown;
}

function ClientCarousel({
  children,
  autoplay = true,
  effect = "fade",
  autoplaySpeed = 4000,
  ...rest
}: CarouselProps) {
  const carouselRef = useRef<CarouselRef>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const childrenArray = React.Children.toArray(children);

  // Touch handling với debounce
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      carouselRef.current?.next();
    } else if (isRightSwipe) {
      carouselRef.current?.prev();
    }

    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd]);

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
    if (autoplay) {
      setIsPaused(true);
    }
  }, [autoplay]);

  const handleMouseLeave = useCallback(() => {
    if (autoplay) {
      setIsPaused(false);
    }
  }, [autoplay]);

  // Pausing effect với better performance
  useEffect(() => {
    if (carouselRef.current && autoplay) {
      if (isPaused) {
        // @ts-expect-error - private API
        carouselRef.current.slickPause?.();
      } else {
        // @ts-expect-error - private API
        carouselRef.current.slickPlay?.();
      }
    }
  }, [isPaused, autoplay]);

  // Keyboard navigation với throttle
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (e.key === "ArrowLeft") {
          handlePrev();
        } else if (e.key === "ArrowRight") {
          handleNext();
        }
      }, 100);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleNext, handlePrev]);

  return (
    <div
      className="relative group rounded-lg overflow-hidden touch-pan-x"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Carousel */}
      <AntCarousel
        ref={carouselRef}
        autoplay={autoplay && !isPaused}
        autoplaySpeed={autoplaySpeed}
        dots={false}
        pauseOnHover={false}
        arrows={false}
        draggable={true}
        swipeToSlide={true}
        speed={600}
        easing="ease-in-out"
        infinite={childrenArray.length > 1}
        effect={effect}
        afterChange={afterChange}
        {...rest}
        className="!rounded-lg !overflow-hidden"
      >
        {children}
      </AntCarousel>

      {/* Enhanced overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Navigation buttons với improved UX */}
      {childrenArray.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center z-20 shadow-xl transition-all opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 border border-white/20"
            aria-label="Previous slide"
            type="button"
          >
            <LeftOutlined className="text-base md:text-xl" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center z-20 shadow-xl transition-all opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 border border-white/20"
            aria-label="Next slide"
            type="button"
          >
            <RightOutlined className="text-base md:text-xl" />
          </button>
        </>
      )}

      {/* Enhanced dots indicator */}
      {childrenArray.length > 1 && (
        <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center gap-1.5 md:gap-2 z-20 px-4">
          {childrenArray.map((_, index) => (
            <button
              key={index}
              onClick={() => carouselRef.current?.goTo(index)}
              className={`h-2 rounded-full transition-all shadow-lg border border-white/30 ${
                currentSlide === index
                  ? "bg-orange-500 w-6 md:w-8"
                  : "bg-white/50 hover:bg-white/70 w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(ClientCarousel);
