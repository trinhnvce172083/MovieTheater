import { useState, useEffect } from "react";
import NOW_SHOWING from "@/constants/HomePage/now_showing";
import UPCOMING from "@/constants/HomePage/upcoming";
import { Movie } from "@/types/HomePage/movie";

export function useMovies() {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setNowShowingMovies(NOW_SHOWING);
      setUpcomingMovies(UPCOMING);
      setLoading(false);
    }, 500); // 0.5s delay for demo
  }, []);

  return { nowShowingMovies, upcomingMovies, loading };
}