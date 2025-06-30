import { Movie, MoviesResponse } from "../admin/getAllMovies";

// Mock data cho movies - phù hợp với database schema
const mockMovies: Movie[] = [
  {
    movieId: 1,
    title: "Avatar: The Way of Water",
    originalTitle: "Avatar: Dòng Chảy Của Nước",
    vietnameseTitle: "Avatar: Dòng Chảy Của Nước",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
    releaseDate: "2024-05-01",
    productionCompany: "20th Century Studios",
    company: "20th Century Studios",
    duration: 192,
    genres: "Action,Adventure,Fantasy",
    versions: ["2D", "3D", "IMAX"],
    rating: "PG-13",
    status: "NOW_SHOWING",
    boxOffice: 2300000000,
    revenue: 2300000000,
    posterUrl: "/posters/Avatar.jpg",
    backdropUrl: "/posters/Avatar.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    director: "James Cameron",
    cast: "Sam Worthington, Zoe Saldana, Sigourney Weaver",
    language: "English",
    country: "United States",
    price: 150000,
    imdbRating: 7.6,
    budget: 350000000,
    isActive: true,
    isFeatured: true,
    isAdultContent: false,
    isNowShowing: true,
    isComingSoon: false,
    isEnded: false,
  },
  {
    movieId: 2,
    title: "Avengers: Endgame",
    originalTitle: "Avengers: Hồi Kết",
    vietnameseTitle: "Avengers: Hồi Kết",
    description: "After the devastating events of Avengers: Infinity War, the universe is in ruins.",
    releaseDate: "2024-01-15",
    productionCompany: "Marvel Studios",
    company: "Marvel Studios",
    duration: 181,
    genres: "Action,Adventure,Sci-Fi",
    versions: ["2D", "3D", "IMAX"],
    rating: "PG-13",
    status: "NOW_SHOWING",
    boxOffice: 2797800564,
    revenue: 2797800564,
    posterUrl: "/posters/Avenger.jpg",
    backdropUrl: "/posters/Avenger.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    director: "Anthony Russo, Joe Russo",
    cast: "Robert Downey Jr., Chris Evans, Mark Ruffalo",
    language: "English",
    country: "United States",
    price: 150000,
    imdbRating: 8.4,
    budget: 356000000,
    isActive: true,
    isFeatured: true,
    isAdultContent: false,
    isNowShowing: true,
    isComingSoon: false,
    isEnded: false,
  },
  {
    movieId: 3,
    title: "Everything Everywhere All at Once",
    originalTitle: "Mọi Thứ Mọi Nơi Tất Cả Một Lúc",
    vietnameseTitle: "Mọi Thứ Mọi Nơi Tất Cả Một Lúc",
    description: "A middle-aged Chinese immigrant is swept up into an insane adventure.",
    releaseDate: "2024-04-01",
    productionCompany: "A24",
    company: "A24",
    duration: 139,
    genres: "Action,Adventure,Fantasy",
    versions: ["2D"],
    rating: "R",
    status: "NOW_SHOWING",
    boxOffice: 140000000,
    revenue: 140000000,
    posterUrl: "/posters/EEAAO.jpg",
    backdropUrl: "/posters/EEAAO.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=wxN1T1uxQ2g",
    director: "Daniel Kwan, Daniel Scheinert",
    cast: "Michelle Yeoh, Ke Huy Quan, Stephanie Hsu",
    language: "English",
    country: "United States",
    price: 120000,
    imdbRating: 7.8,
    budget: 25000000,
    isActive: true,
    isFeatured: false,
    isAdultContent: true,
    isNowShowing: true,
    isComingSoon: false,
    isEnded: false,
  },
  {
    movieId: 4,
    title: "Spider-Man: No Way Home",
    originalTitle: "Người Nhện: Không Còn Nhà",
    vietnameseTitle: "Người Nhện: Không Còn Nhà",
    description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help.",
    releaseDate: "2024-02-01",
    productionCompany: "Sony Pictures",
    company: "Sony Pictures",
    duration: 148,
    genres: "Action,Adventure,Sci-Fi",
    versions: ["2D", "3D", "IMAX"],
    rating: "PG-13",
    status: "NOW_SHOWING",
    boxOffice: 1921847111,
    revenue: 1921847111,
    posterUrl: "/posters/Spider-man.jpg",
    backdropUrl: "/posters/Spider-man.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=JfVOs4VSpmA",
    director: "Jon Watts",
    cast: "Tom Holland, Zendaya, Benedict Cumberbatch",
    language: "English",
    country: "United States",
    price: 150000,
    imdbRating: 8.2,
    budget: 200000000,
    isActive: true,
    isFeatured: true,
    isAdultContent: false,
    isNowShowing: true,
    isComingSoon: false,
    isEnded: false,
  },
  {
    movieId: 5,
    title: "Top Gun: Maverick",
    originalTitle: "Phi Công Siêu Đẳng Maverick",
    vietnameseTitle: "Phi Công Siêu Đẳng Maverick",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
    releaseDate: "2024-03-01",
    productionCompany: "Paramount Pictures",
    company: "Paramount Pictures",
    duration: 131,
    genres: "Action,Drama",
    versions: ["2D", "IMAX"],
    rating: "PG-13",
    status: "NOW_SHOWING",
    boxOffice: 1493454116,
    revenue: 1493454116,
    posterUrl: "/posters/Topgun.jpeg",
    backdropUrl: "/posters/Topgun.jpeg",
    trailerUrl: "https://www.youtube.com/watch?v=giXco2jaZ_4",
    director: "Joseph Kosinski",
    cast: "Tom Cruise, Miles Teller, Jennifer Connelly",
    language: "English",
    country: "United States",
    price: 140000,
    imdbRating: 8.3,
    budget: 170000000,
    isActive: true,
    isFeatured: false,
    isAdultContent: false,
    isNowShowing: true,
    isComingSoon: false,
    isEnded: false,
  },
  {
    movieId: 6,
    title: "The Batman",
    originalTitle: "Người Dơi",
    vietnameseTitle: "Người Dơi",
    description: "In his second year of fighting crime, Batman uncovers corruption in Gotham City.",
    releaseDate: "2024-06-15",
    productionCompany: "Warner Bros. Pictures",
    company: "Warner Bros. Pictures",
    duration: 176,
    genres: "Action,Crime,Drama",
    versions: ["2D", "IMAX"],
    rating: "PG-13",
    status: "COMING_SOON",
    boxOffice: 770836163,
    revenue: 770836163,
    posterUrl: "/posters/Avatar.jpg",
    backdropUrl: "/posters/Avatar.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    director: "Matt Reeves",
    cast: "Robert Pattinson, Zoë Kravitz, Paul Dano",
    language: "English",
    country: "United States",
    price: 160000,
    imdbRating: 7.8,
    budget: 200000000,
    isActive: true,
    isFeatured: false,
    isAdultContent: false,
    isNowShowing: false,
    isComingSoon: true,
    isEnded: false,
  },
  {
    movieId: 7,
    title: "Black Panther: Wakanda Forever",
    originalTitle: "Black Panther: Wakanda Bất Diệt",
    vietnameseTitle: "Black Panther: Wakanda Bất Diệt",
    description: "The people of Wakanda fight to protect their home from intervening world powers.",
    releaseDate: "2024-07-20",
    productionCompany: "Marvel Studios",
    company: "Marvel Studios",
    duration: 161,
    genres: "Action,Adventure,Drama",
    versions: ["2D", "3D", "IMAX"],
    rating: "PG-13",
    status: "COMING_SOON",
    boxOffice: 859208836,
    revenue: 859208836,
    posterUrl: "/posters/Avenger.jpg",
    backdropUrl: "/posters/Avenger.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=_Z3QKkl1WyM",
    director: "Ryan Coogler",
    cast: "Letitia Wright, Lupita Nyong'o, Danai Gurira",
    language: "English",
    country: "United States",
    price: 150000,
    imdbRating: 6.7,
    budget: 250000000,
    isActive: true,
    isFeatured: false,
    isAdultContent: false,
    isNowShowing: false,
    isComingSoon: true,
    isEnded: false,
  },
  {
    movieId: 8,
    title: "Dune",
    originalTitle: "Dune",
    vietnameseTitle: "Dune",
    description: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family.",
    releaseDate: "2024-08-10",
    productionCompany: "Warner Bros. Pictures",
    company: "Warner Bros. Pictures",
    duration: 155,
    genres: "Adventure,Drama,Sci-Fi",
    versions: ["2D", "IMAX"],
    rating: "PG-13",
    status: "COMING_SOON",
    boxOffice: 402027830,
    revenue: 402027830,
    posterUrl: "/posters/EEAAO.jpg",
    backdropUrl: "/posters/EEAAO.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=n9xhJrPXop4",
    director: "Denis Villeneuve",
    cast: "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac",
    language: "English",
    country: "United States",
    price: 130000,
    imdbRating: 8.0,
    budget: 165000000,
    isActive: true,
    isFeatured: false,
    isAdultContent: false,
    isNowShowing: false,
    isComingSoon: true,
    isEnded: false,
  },
];

// Mock API functions
export const mockGetMovies = async (params: any = {}): Promise<MoviesResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredMovies = [...mockMovies];

  // Apply search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredMovies = filteredMovies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.vietnameseTitle?.toLowerCase().includes(searchTerm) ||
      movie.movieId.toString().includes(searchTerm)
    );
  }

  // Apply status filter
  if (params.status) {
    filteredMovies = filteredMovies.filter(movie => movie.status === params.status);
  }

  // Apply genre filter
  if (params.genre) {
    filteredMovies = filteredMovies.filter(movie => 
      movie.genres?.toLowerCase().includes(params.genre.toLowerCase())
    );
  }

  // Apply sorting
  if (params.sortBy) {
    filteredMovies.sort((a, b) => {
      const aValue = a[params.sortBy as keyof Movie];
      const bValue = b[params.sortBy as keyof Movie];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return params.sortDirection === 'desc' 
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return params.sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      return 0;
    });
  }

  // Apply pagination
  const page = params.page || 0;
  const size = params.size || 10;
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

  return {
    content: paginatedMovies,
    totalElements: filteredMovies.length,
    totalPages: Math.ceil(filteredMovies.length / size),
    size: size,
    number: page,
    first: page === 0,
    last: endIndex >= filteredMovies.length,
  };
};

export const mockCreateMovie = async (movieData: Omit<Movie, 'movieId'>): Promise<Movie> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newMovie: Movie = {
    ...movieData,
    movieId: Math.max(...mockMovies.map(m => m.movieId)) + 1,
    // Set default values
    isActive: movieData.isActive ?? true,
    isFeatured: movieData.isFeatured ?? false,
    status: movieData.status ?? "COMING_SOON",
    versions: movieData.versions ?? ["2D", "3D", "IMAX"],
  };
  
  mockMovies.push(newMovie);
  return newMovie;
};

export const mockUpdateMovie = async (id: string, movieData: Partial<Movie>): Promise<Movie> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockMovies.findIndex(movie => movie.movieId === parseInt(id));
  if (index === -1) {
    throw new Error('Movie not found');
  }
  
  mockMovies[index] = { ...mockMovies[index], ...movieData };
  return mockMovies[index];
};

export const mockDeleteMovie = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockMovies.findIndex(movie => movie.movieId === parseInt(id));
  if (index === -1) {
    throw new Error('Movie not found');
  }
  
  mockMovies.splice(index, 1);
};

export const mockGetMovieById = async (id: string): Promise<Movie> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const movie = mockMovies.find(movie => movie.movieId === parseInt(id));
  if (!movie) {
    throw new Error('Movie not found');
  }
  
  return movie;
}; 