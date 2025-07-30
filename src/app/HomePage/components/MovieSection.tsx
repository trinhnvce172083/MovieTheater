import React, { useEffect, useState } from "react";
import { MovieCard } from "@/app/HomePage/components/MovieCard";
import NavButton from "./NavButton";
import { Movie } from "@/types/NowShowing/movie";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MovieSection({
  title,
  movies,
  scrollRef,
  loading,
  onScrollLeft: propOnScrollLeft,
  onScrollRight: propOnScrollRight,
  isUpcoming = false,
}: {
  title: string;
  movies: Movie[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  loading: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  isUpcoming?: boolean;
}) {  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);
  const [cardWidth, setCardWidth] = useState(0);
  
  // Custom scroll handlers that use cardWidth to scroll by exactly one card
  const onScrollLeft = () => {
    if (!scrollRef.current || cardWidth === 0) return;
    
    // Scroll left by one card width
    scrollRef.current.scrollBy({
      left: -cardWidth,
      behavior: 'smooth'
    });
    
    // Also call the original scroll handler if provided
    propOnScrollLeft();
  };
    const onScrollRight = () => {
    if (!scrollRef.current || cardWidth === 0) return;
    
    // Scroll right by one card width
    scrollRef.current.scrollBy({
      left: cardWidth,
      behavior: 'smooth'
    });
    
    // Also call the original scroll handler if provided
    propOnScrollRight();
  };
  
  // Calculate card width including gap
  useEffect(() => {
    const calculateCardWidth = () => {
      // Try to measure an actual card if available
      const container = scrollRef.current;
      if (container && container.firstElementChild && container.children.length > 1) {
        // Get the first card and measure its width + the gap
        const firstCard = container.firstElementChild as HTMLElement;
        const secondCard = container.children[1] as HTMLElement;
        if (firstCard && secondCard) {
          // Calculate width including gap (distance from left edge of first card to left edge of second card)
          const fullWidth = secondCard.offsetLeft - firstCard.offsetLeft;
          setCardWidth(fullWidth);
        } else if (firstCard) {
          // Fallback with responsive gap calculation
          const gap = window.innerWidth >= 768 ? 32 : window.innerWidth >= 640 ? 24 : 16;
          setCardWidth(firstCard.offsetWidth + gap);
        }
      }
    };
    
    calculateCardWidth();
    window.addEventListener('resize', calculateCardWidth);
    
    return () => window.removeEventListener('resize', calculateCardWidth);
  }, [scrollRef, movies, propOnScrollLeft, propOnScrollRight]);

  // Update shadows on scroll and window resize
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

    // Check on resize too, as content width might change
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

  const navLinkPath = isUpcoming ? "/movies-api" : "/NowShowing";

  return (
    <section className="mb-8 sm:mb-12 md:mb-16 relative">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        <Link href={navLinkPath} className="flex items-center text-orange-500 hover:text-orange-400 transition-colors group">
          <span className="mr-1 text-sm sm:text-base">View All</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Container with relative position for shadows and buttons */}
      <div className="relative">
        {/* Left shadow gradient when scrolled */}
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Right shadow gradient when there's more content */}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Navigation buttons */}
        <NavButton direction="left" onClick={onScrollLeft} disabled={!showLeftShadow} />
        <NavButton direction="right" onClick={onScrollRight} disabled={!showRightShadow} />
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide py-4 px-1"
          style={{ 
            scrollBehavior: "smooth",
            msOverflowStyle: "none",  /* IE and Edge */
            scrollbarWidth: "none"   /* Firefox */
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center w-full py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-8 w-full text-gray-400">No movies found.</div>
          ) : (            movies.map((movie) => (
              <div 
                key={movie.movieId || movie.title} 
                className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px]"
              >
                <MovieCard movie={movie} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
