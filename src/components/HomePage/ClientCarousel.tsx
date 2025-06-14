//Banner Carousel Component

"use client";

import { Carousel as AntCarousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface CarouselProps {
  children: React.ReactNode;
  autoplay?: boolean;
  effect?: "scrollx" | "fade";
  [x: string]: unknown;
}

export default function ClientCarousel({
  children,
  autoplay = true,
  effect = "fade",
  ...rest
}: CarouselProps) {
  const carouselRef = useRef<CarouselRef>(null);

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
        infinite
        effect={effect}
        {...rest}
        className="!rounded-lg !overflow-hidden"
      >
        {children}
      </AntCarousel>
      <button
        onClick={() => carouselRef.current?.prev()}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 hover:bg-gray-200 bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-all"
        aria-label="Previous slide"
      >
        <LeftOutlined style={{ fontSize: 16 }} />
      </button>
      <button
        onClick={() => carouselRef.current?.next()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 hover:bg-gray-200 bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-all"
        aria-label="Next slide"
      >
        <RightOutlined style={{ fontSize: 16 }} />
      </button>
    </div>
  );
}
