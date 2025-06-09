//Banner Carousel Component

"use client";

import { Carousel as AntCarousel, Card } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface CarouselProps {
  children: React.ReactNode;
  autoplay?: boolean;
  effect?: "scrollx" | "fade";
  [x: string]: any;
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
        infinite={true}
        effect={effect}
        
        {...rest}
      >
        {children}
      </AntCarousel>
      
      {/* Custom Navigation Buttons */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-all"
        aria-label="Previous slide"
      >
        <LeftOutlined style={{ fontSize: '16px' }} />
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-all"
        aria-label="Next slide"
      >
        <RightOutlined style={{ fontSize: '16px' }} />
      </button>
    </div>
  );
}
