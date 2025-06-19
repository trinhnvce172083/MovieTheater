import { useEffect, useState } from "react";
import { Movie } from "@/types/NowShowing/movie";
import { MovieApiService } from "@/api/movie-api";

export function useMovies() {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      MovieApiService.getNowShowingMovies(),
      MovieApiService.getUpComingMovies(),
    ]).then(([nowRes, upRes]) => {
      setNowShowingMovies(nowRes.data || []);
      setUpcomingMovies(upRes.data || []);
      setLoading(false);
    });
  }, []);

  return { nowShowingMovies, upcomingMovies, loading };
}