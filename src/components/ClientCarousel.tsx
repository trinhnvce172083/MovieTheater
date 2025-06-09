"use client";

import { Carousel as AntCarousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import { useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface CarouselProps {
  children: React.ReactNode;
  autoplay?: boolean;
  effect?: "scrollx" | "fade";
  [key: string]: unknown; // để nhận thêm props tùy ý
}

export default function ClientCarousel({
  children,
  autoplay = true,
  effect = "fade",
  ...rest
}: CarouselProps) {
  const carouselRef = useRef<CarouselRef>(null);

  const goToPrev = () => {
    carouselRef.current?.prev();
  };

  const goToNext = () => {
    carouselRef.current?.next();
  };

  return (
    <div className="relative">
      <AntCarousel
        ref={carouselRef}
        autoplay={autoplay}
        autoplaySpeed={3000}
        dots={false}
        pauseOnHover={false}
        arrows={false}
        draggable={false}
        swipeToSlide={false}
        speed={500}
        easing="ease-in-out"
        vertical={false}
        verticalSwiping={false}
        infinite
        effect={effect}
        {...rest}
      >
        {children}
      </AntCarousel>

      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-all"
        aria-label="Previous slide"
        type="button"
      >
        <LeftOutlined style={{ fontSize: 16 }} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-all"
        aria-label="Next slide"
        type="button"
      >
        <RightOutlined style={{ fontSize: 16 }} />
      </button>
    </div>
  );
}
