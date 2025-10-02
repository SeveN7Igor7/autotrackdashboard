import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Add custom headers to allow mixed content
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Set headers to allow HTTP requests from HTTPS pages
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: http: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' http: https: ws: wss:; " +
    "frame-src 'none';"
  );
  
  // Remove upgrade insecure requests
  response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};