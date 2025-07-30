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
      console.log("Now Showing Response:", nowRes);
      console.log("Upcoming Response:", upRes);
      console.log("Now Showing Data:", nowRes && nowRes.data ? nowRes.data : []);
      console.log("Upcoming Data:", upRes && upRes.data ? upRes.data : []);
      setNowShowingMovies(nowRes && nowRes.data ? nowRes.data : []);
      setUpcomingMovies(upRes && upRes.data ? upRes.data : []);
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching movies:", error);
      setLoading(false);
    });
  }, []);

  return { nowShowingMovies, upcomingMovies, loading };
}