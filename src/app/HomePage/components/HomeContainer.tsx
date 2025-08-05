"use client";

import { useRef, useCallback, memo } from "react";
import { useMovies } from "@/hooks/HomePage/useMovies";
import MovieSection from "./MovieSection";
import HomepageCarousel from "./HomepageCarousel";

const HomeContainer = memo(function HomeContainer() {
  const { nowShowingMovies, upcomingMovies, loading } = useMovies();
  const nowShowingRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback(
    (
      ref: React.RefObject<HTMLDivElement | null>,
      direction: "left" | "right"
    ) => {
      if (ref.current) {
        const scrollAmount = window.innerWidth >= 768 ? 340 : 280; // Tăng scroll amount
        const targetScrollLeft =
          ref.current.scrollLeft +
          (direction === "left" ? -scrollAmount : scrollAmount);

        ref.current.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth",
        });
      }
    },
    []
  );

  return (
    <main className="min-h-screen">
      {/* Hero Carousel Section - Ưu tiên hiển thị phim thay vì promotion */}
      <section className="relative w-full">
        <HomepageCarousel />
      </section>

      {/* Movies Container */}
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Now Showing Section */}
        <section className="mt-8 sm:mt-12">
          <MovieSection
            title="NOW SHOWING"
            movies={nowShowingMovies}
            scrollRef={nowShowingRef}
            loading={loading}
            onScrollLeft={() => scroll(nowShowingRef, "left")}
            onScrollRight={() => scroll(nowShowingRef, "right")}
            isUpcoming={false}
          />
        </section>

        {/* Upcoming Section */}
        <section className="mt-8 sm:mt-12 pb-8">
          <MovieSection
            title="COMING SOON"
            movies={upcomingMovies}
            scrollRef={upcomingRef}
            loading={loading}
            isUpcoming={true}
            onScrollLeft={() => scroll(upcomingRef, "left")}
            onScrollRight={() => scroll(upcomingRef, "right")}
          />
        </section>
      </div>
    </main>
  );
});

export default HomeContainer;
