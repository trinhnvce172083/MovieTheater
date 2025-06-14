"use client";

import { useRef } from "react";
import { useMovies } from "@/hooks/HomePage/useMovies";
import Image from "next/image";
import MovieSection from "@/components/HomePage/MovieSection";
import ClientCarousel from "@/components/HomePage/ClientCarousel";
import PROMOTIONS from "@/constants/HomePage/promotions";

export default function Home() {
  const { nowShowingMovies, upcomingMovies, loading } = useMovies();
  const nowShowingRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      ref.current.scrollTo({
        left: ref.current.scrollLeft + (direction === "left" ? -300 : 300),
        behavior: "smooth",
      });
    }
  };

  return (
    <main>
      <ClientCarousel autoplay effect="scrollx">
        {PROMOTIONS.map((promo) => (
          <div key={promo.id} className="relative w-full h-[550px]">
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>
        ))}
      </ClientCarousel>

      <div className="mt-8 text-white">
      <MovieSection
        title="NOW SHOWING"
        movies={nowShowingMovies}
        scrollRef={nowShowingRef}
        loading={loading}
        onScrollLeft={() => scroll(nowShowingRef, "left")}
        onScrollRight={() => scroll(nowShowingRef, "right")}
      />
      </div>
      <div className="mt-8 text-white">
      <MovieSection
        title="UPCOMING"
        movies={upcomingMovies}
        scrollRef={upcomingRef}
        loading={loading}
        isUpcoming
        onScrollLeft={() => scroll(upcomingRef, "left")}
        onScrollRight={() => scroll(upcomingRef, "right")}
      />
      </div>
    </main>
  );
}
