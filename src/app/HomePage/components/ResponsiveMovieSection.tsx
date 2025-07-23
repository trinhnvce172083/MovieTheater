"use client";

import React, { useEffect, useState, memo } from "react";
import { ResponsiveMovieCard } from "./ResponsiveMovieCard";
import ResponsiveNavButton from "./ResponsiveNavButton";
import { Movie } from "@/types/NowShowing/movie";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ResponsiveMovieSectionProps {
  title: string;
  movies: Movie[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  loading: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  isUpcoming?: boolean;
}

const ResponsiveMovieSection = memo(function ResponsiveMovieSection({
  title,
  movies,
  scrollRef,
  loading,
  onScrollLeft,
  onScrollRight,
  isUpcoming = false,
}: ResponsiveMovieSectionProps) {
  console.log(`${title} - Movies:`, movies, `Loading: ${loading}`);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);
  const [cardWidth, setCardWidth] = useState(0);

  // Calculate card width for responsive scrolling
  useEffect(() => {
    const calculateCardWidth = () => {
      const container = scrollRef.current;
      if (
        container &&
        container.firstElementChild &&
        container.children.length > 1
      ) {
        const firstCard = container.firstElementChild as HTMLElement;
        const secondCard = container.children[1] as HTMLElement;
        if (firstCard && secondCard) {
          const fullWidth = secondCard.offsetLeft - firstCard.offsetLeft;
          setCardWidth(fullWidth);
        } else if (firstCard) {
          const gap = window.innerWidth >= 640 ? 24 : 16; // sm:gap-6 = 24px, gap-4 = 16px
          setCardWidth(firstCard.offsetWidth + gap);
        }
      }
    };

    calculateCardWidth();
    window.addEventListener("resize", calculateCardWidth);

    return () => window.removeEventListener("resize", calculateCardWidth);
  }, [scrollRef, movies]);

  // Update shadows on scroll
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      setShowLeftShadow(element.scrollLeft > 20);
      setShowRightShadow(
        element.scrollWidth > element.clientWidth &&
          element.scrollLeft < element.scrollWidth - element.clientWidth - 20
      );
    };

    const handleResize = () => {
      handleScroll();
    };

    element.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial check
    handleScroll();

    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollRef, movies]);

  // Custom scroll handlers
  const handleScrollLeft = () => {
    if (!scrollRef.current || cardWidth === 0) return;

    scrollRef.current.scrollBy({
      left: -cardWidth,
      behavior: "smooth",
    });

    onScrollLeft();
  };

  const handleScrollRight = () => {
    if (!scrollRef.current || cardWidth === 0) return;

    scrollRef.current.scrollBy({
      left: cardWidth,
      behavior: "smooth",
    });

    onScrollRight();
  };

  if (loading) {
    return (
      <div className="text-white">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={`loading-${i}`}
              className="flex-shrink-0 w-48 sm:w-56 md:w-64"
            >
              <div className="aspect-[3/4] bg-gray-700 rounded animate-pulse mb-3" />
              <div className="h-4 bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={isUpcoming ? "/ComingSoon" : "/NowShowing"}
            className="hidden sm:flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            View All
            <ArrowRight size={16} />
          </Link>
          <div className="flex gap-2">
            <ResponsiveNavButton
              onClick={handleScrollLeft}
              disabled={!showLeftShadow}
              direction="left"
              icon={<ChevronLeft size={16} />}
            />
            <ResponsiveNavButton
              onClick={handleScrollRight}
              disabled={!showRightShadow}
              direction="right"
              icon={<ChevronRight size={16} />}
            />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Left Shadow */}
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        )}

        {/* Right Shadow */}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <ResponsiveMovieCard
              key={movie.movieId}
              movie={movie}
              isUpcoming={isUpcoming}
            />
          ))}
        </div>
      </div>

      {/* Mobile View All Link */}
      <div className="sm:hidden mt-4 text-center">
        <Link
          href={isUpcoming ? "/ComingSoon" : "/NowShowing"}
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          View All {title}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
});

export default ResponsiveMovieSection;
