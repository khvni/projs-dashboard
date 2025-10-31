// Middleware for protecting routes with NextAuth
import { auth } from '@/lib/auth/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/public-view', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn && !pathname.startsWith('/login')) {
    return Response.redirect(new URL('/login', req.nextUrl.origin));
  }

  // Allow authenticated users to proceed
  return;
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
};
