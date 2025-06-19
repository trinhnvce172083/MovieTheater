const ROUTES = {
  // Public Routes
  HOME: "/HomePage",
  NOW_SHOWING: "/NowShowing",
  COMING_SOON: "/Coming-soon",
  LOGIN: "/auth/Login",
  REGISTER: "/auth/Register",
  ACCOUNT: "/auth/Account",

  //Booking Routes
  //   BOOKING: "/booking",
  // BOOKING_SELECT_MOVIE: "/booking/select-movie",
  // BOOKING_SELECT_DATE: "/booking/select-date",
  // BOOKING_SELECT_TIME: "/booking/select-time",
  BOOKING_SELECT_SEAT: "/booking/seat-selection",

  // Movie Routes
  MOVIES: "/movies",
  MOVIES_API: "/movies-api",
  MOVIE_DETAILS: (id: string) => `/movies/MovieDetails/${id}`,

  // Member Routes
  MEMBER_DASHBOARD: "/member",
  MEMBER_PROFILE: "/member/profile",
  MEMBER_BOOKINGS: "/member/bookings",
  MEMBER_HISTORY: "/member/history",
  MEMBER_TICKETS: "/member/tickets",

  // Admin Routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_MOVIES: "/admin/movies",
  ADMIN_MEMBERS: "/admin/members",
  ADMIN_ROOMS: "/admin/rooms",
  ADMIN_SHOWTIMES: "/admin/showtimes",
  ADMIN_TICKETS: "/admin/tickets",
  ADMIN_REVENUE: "/admin/revenue",
} as const;

export default ROUTES;
