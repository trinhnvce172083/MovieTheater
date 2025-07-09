const ROUTES = {
  // Public Routes
  HOME: "/HomePage",
  NOW_SHOWING: "/NowShowing",
  COMING_SOON: "/ComingSoon",
  LOGIN: "/auth/Login",
  REGISTER: "/auth/Register",
  ACCOUNT: "/auth/Account",
  FORGOT_PASSWORD: "/auth/Forgot-password",
  ACCESS_DENIED: "/access-denied",

  // Booking Routes
  BOOKING: "/booking",
  BOOKING_SELECT_SEAT: "/booking/seat-selection",
  BOOKING_CONFIRM: "/booking/confirm",
  BOOKING_PAYMENT: "/booking/payment",
  BOOKING_CORNCHIP: "/booking/CornChip",
  CORNCHIP: "/booking/CornChip", // Alias for backward compatibility

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
  ADMIN_MOVIES: "/admin/movies",
  ADMIN_MEMBERS: "/admin/members",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_ROOMS: "/admin/rooms",
  ADMIN_PROMOTIONS: "/admin/promotions",

  // Email Verification Routes
  VERIFY_EMAIL: (token: string) => `/auth/verify-email/${token}`,
  VERIFY_EMAIL_ERROR: "/auth/verify-email/invalid",
} as const;

export default ROUTES;
