"use client";

import { useRef, useCallback, memo } from "react";
import { useMovies } from "@/hooks/HomePage/useMovies";
import Image from "next/image";
import MovieSection from "./MovieSection";
import ClientCarousel from "./ClientCarousel";
import PROMOTIONS from "@/constants/HomePage/promotions";

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
        const scrollAmount = window.innerWidth >= 768 ? 320 : 260; // Responsive scroll amount
        ref.current.scrollTo({
          left:
            ref.current.scrollLeft +
            (direction === "left" ? -scrollAmount : scrollAmount),
          behavior: "smooth",
        });
      }
    },
    []
  );

  return (
    <main className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative w-full">
        <ClientCarousel autoplay effect="scrollx">
          {PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              className="relative w-full h-[200px] sm:h-[300px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
            >
              <Image
                src={promo.image}
                alt={promo.title}
                style={{ objectFit: "contain" }}
                fill
                className="object-center"
                priority={false}
                sizes="100vw"
                quality={100}
              />
              <div className="absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              </div>
            </div>
          ))}
        </ClientCarousel>
      </section>

      {/* Now Showing Section */}
      <section className="mt-8 sm:mt-12 px-4 sm:px-6 lg:px-8">
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
      <section className="mt-8 sm:mt-12 px-4 sm:px-6 lg:px-8 pb-8">
        <MovieSection
          title="UPCOMING"
          movies={upcomingMovies}
          scrollRef={upcomingRef}
          loading={loading}
          isUpcoming={true}
          onScrollLeft={() => scroll(upcomingRef, "left")}
          onScrollRight={() => scroll(upcomingRef, "right")}
        />
      </section>
    </main>
  );
});

export default HomeContainer;
