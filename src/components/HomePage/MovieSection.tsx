import React from "react";
import { MovieCard } from "@/components/HomePage/MovieCard";
import NavButton from "./NavButton";
import { Movie } from "@/types/NowShowing/movie";

export default function MovieSection({
  title,
  movies,
  scrollRef,
  loading,
  onScrollLeft,
  onScrollRight,
  isUpcoming = false,
}: {
  title: string;
  movies: Movie[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  loading: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  isUpcoming?: boolean;
}) {
  return (
    <section className="mb-16 relative">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <NavButton direction="left" onClick={onScrollLeft} />
      <NavButton direction="right" onClick={onScrollRight} />
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading ? (
          <div>Loading...</div>
        ) : movies.length === 0 ? (
          <div>No movies found.</div>
        ) : (
          movies.map((movie) => <MovieCard key={movie.title} movie={movie} />)
        )}
      </div>
    </section>
  );
}
