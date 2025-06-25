import { NextRequest, NextResponse } from "next/server";
import { Role } from "./src/casl/roles";
import ROUTES from "./src/constants/routes";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check for protected routes
  const matchedRoute = protectedRoutes.find((route) =>
    route.pattern.test(path)
  );

  if (!matchedRoute) {
    // Not a protected route, allow access
    return NextResponse.next();
  }

  // Get authentication info from cookies
  const authToken = request.cookies.get("authToken")?.value;
  const userRole = request.cookies.get("userRole")?.value as Role | undefined;

  // If no auth token or role cookie, user is not authenticated
  if (!authToken || !userRole) {
    // Create return URL for login redirect
    const returnUrl = encodeURIComponent(
      request.nextUrl.pathname +
        (request.nextUrl.search ? `?${request.nextUrl.search}` : "")
    );

    // Redirect to login for authentication
    if (matchedRoute.redirectTo === ROUTES.LOGIN) {
      return NextResponse.redirect(
        new URL(`${ROUTES.LOGIN}?returnUrl=${returnUrl}`, request.url)
      );
    }

    // Redirect to access denied
    return NextResponse.redirect(new URL(matchedRoute.redirectTo, request.url));
  }

  // Check if user has required role
  if (!matchedRoute.roles.includes(userRole)) {
    // User is authenticated but doesn't have the required role
    return NextResponse.redirect(new URL(matchedRoute.redirectTo, request.url));
  }

  // User is authenticated and authorized, allow access
  return NextResponse.next();
}

// Map of route patterns to required roles
const protectedRoutes = [
  {
    pattern: /^\/admin(\/.*)?$/,
    roles: [Role.ADMIN],
    redirectTo: ROUTES.ACCESS_DENIED,
  },
  {
    pattern: /^\/staff(\/.*)?$/,
    roles: [Role.ADMIN, Role.STAFF],
    redirectTo: ROUTES.ACCESS_DENIED,
  },
  {
    pattern: /^\/member(\/.*)?$/,
    roles: [Role.ADMIN, Role.STAFF, Role.MEMBER],
    redirectTo: ROUTES.LOGIN,
  },
  {
    pattern: /^\/booking(\/.*)?$/,
    roles: [Role.ADMIN, Role.STAFF, Role.MEMBER],
    redirectTo: ROUTES.LOGIN,
  },
  {
    pattern: /^\/payment(\/.*)?$/,
    roles: [Role.ADMIN, Role.STAFF, Role.MEMBER],
    redirectTo: ROUTES.LOGIN,
  },
  {
    pattern: new RegExp(`^${ROUTES.BOOKING_SELECT_SEAT}(\/.*)?$`),
    roles: [Role.ADMIN, Role.STAFF, Role.MEMBER],
    redirectTo: ROUTES.LOGIN,
  },
  {
    pattern: new RegExp(`^${ROUTES.MEMBER_TICKETS}(\/.*)?$`),
    roles: [Role.ADMIN, Role.STAFF, Role.MEMBER],
    redirectTo: ROUTES.LOGIN,
  },
];

// Specify which paths this middleware should run for
export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/member/:path*",
    "/booking/:path*",
    "/payment/:path*",
  ],
};
