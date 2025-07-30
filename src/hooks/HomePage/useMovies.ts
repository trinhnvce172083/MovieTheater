import { useEffect, useState } from "react";
import { Movie } from "@/types/NowShowing/movie";
import { MovieApiService } from "@/api/movie-api";

export function useMovies() {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        const [nowRes, upRes] = await Promise.all([
          MovieApiService.getNowShowingMovies(),
          MovieApiService.getComingSoonMovies()
        ]);

        if (nowRes.success && nowRes.data) {
          setNowShowing(nowRes.data);
        }
        
        if (upRes.success && upRes.data) {
          setUpcoming(upRes.data);
        }
      } catch (error) {
        setError('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return { nowShowingMovies, upcomingMovies, loading };
}