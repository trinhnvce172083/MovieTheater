import { MovieResponse, MovieFilters } from '../types';

// Mock data for offline mode
export const MOCK_MOVIES: MovieResponse[] = [
  {
    movieId: "1",
    title: "Avengers: Endgame",
    genre: ["Action", "Adventure", "Drama"],
    duration: 181,
    formattedDuration: "3h 1m",
    releaseDate: "2024-04-26",
    rating: "PG-13",
    posterUrl: "/posters/Avenger.jpg",
    price: 120000,
    status: "NOW_SHOWING",
    imdbRating: 8.4,
    isFeatured: true,
    isAdultContent: false
  },
  {
    movieId: "2",
    title: "Spider-Man: No Way Home",
    genre: ["Action", "Adventure", "Fantasy"],
    duration: 148,
    formattedDuration: "2h 28m",
    releaseDate: "2024-12-17",
    rating: "PG-13",
    posterUrl: "/posters/Spider-man.jpg",
    price: 110000,
    status: "COMING_SOON",
    imdbRating: 8.2,
    isFeatured: true,
    isAdultContent: false
  },
  {
    movieId: "3",
    title: "Top Gun: Maverick",
    genre: ["Action", "Drama"],
    duration: 131,
    formattedDuration: "2h 11m",
    releaseDate: "2024-05-27",
    rating: "PG-13",
    posterUrl: "/posters/Topgun.jpeg",
    price: 115000,
    status: "NOW_SHOWING",
    imdbRating: 8.7,
    isFeatured: false,
    isAdultContent: false
  }
];

export const filterMovies = (movies: MovieResponse[], filters: MovieFilters): MovieResponse[] => {
  return movies.filter(movie => {
    const matchesSearch = !filters.searchTerm || 
      movie.title.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesGenre = !filters.filterGenre || (() => {
      const genre = (movie as any).genre;
      if (Array.isArray(genre)) {
        return genre.some(g => g.toLowerCase().includes(filters.filterGenre!.toLowerCase()));
      } else if (typeof genre === 'string') {
        return genre.toLowerCase().includes(filters.filterGenre!.toLowerCase());
      }
      return false;
    })();
    
    const matchesStatus = !filters.filterStatus || movie.status === filters.filterStatus;
    
    const matchesRating = !filters.filterRating || movie.rating === filters.filterRating;
    
    return matchesSearch && matchesGenre && matchesStatus && matchesRating;
  });
};

export const calculateMovieStatistics = (movies: MovieResponse[]) => {
  const totalMovies = movies.length;
  const activeMovies = movies.filter(movie => movie.status === 'NOW_SHOWING').length;
  const comingSoonMovies = movies.filter(movie => movie.status === 'COMING_SOON').length;
  const avgRating = 4.5; // Static for now, could be calculated from actual ratings

  return {
    totalMovies,
    activeMovies,
    comingSoonMovies,
    avgRating
  };
};

export const formatMovieStatus = (status: string): string => {
  switch (status) {
    case 'NOW_SHOWING': return 'Now Showing';
    case 'COMING_SOON': return 'Coming Soon';
    case 'ENDED': return 'Ended';
    default: return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'NOW_SHOWING': return 'green';
    case 'COMING_SOON': return 'blue';
    case 'ENDED': return 'red';
    default: return 'default';
  }
};

export const getRatingColor = (rating: string): string => {
  switch (rating) {
    case 'G': return 'green';
    case 'PG': return 'blue';
    case 'PG-13': return 'orange';
    case 'R': return 'red';
    case 'NC-17': return 'purple';
    default: return 'default';
  }
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const validateMovieForm = (values: any): string[] => {
  const errors: string[] = [];
  
  if (!values.title?.trim()) {
    errors.push('Movie title is required');
  }
  
  if (!values.genre || values.genre.length === 0) {
    errors.push('At least one genre is required');
  }
  
  if (!values.duration || values.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }
  
  if (!values.releaseDate) {
    errors.push('Release date is required');
  }
  
  if (!values.rating) {
    errors.push('Rating is required');
  }
  
  if (!values.status) {
    errors.push('Status is required');
  }
  
  if (!values.price || values.price <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  return errors;
};
