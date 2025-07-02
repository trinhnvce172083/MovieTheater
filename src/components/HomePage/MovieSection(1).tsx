import React from "react";
import MovieCard from "./MovieCard";
import NavButton from "./NavButton";
import { Movie } from "@/types/HomePage/movie";

export default function MovieSection({
  title,
  movies,
  scrollRef,
  loading,
  isUpcoming = false,
  onScrollLeft,
  onScrollRight,
}: {
  title: string;
  movies: Movie[];
  scrollRef: React.RefObject<HTMLDivElement  | null>;
  loading: boolean;
  isUpcoming?: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}) {
  return (
    <section className="mb-16 relative">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <NavButton direction="left" onClick={onScrollLeft} />
      <NavButton direction="right" onClick={onScrollRight} />
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading
          ? <div>Loading...</div>
          : movies.length === 0
            ? <div>No movies found.</div>
            : movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} isUpcoming={isUpcoming} />
              ))}
      </div>
    </section>
  );
}