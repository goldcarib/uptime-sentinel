
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // This handles the redirect from Supabase's auth email link
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    // If there's a next URL in the params, redirect to it
    const next = request.nextUrl.searchParams.get("next");
    if (next) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    // Otherwise, redirect to a default page
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // The reset-password page relies on the URL hash containing the access token.
  // The middleware shouldn't redirect from it, otherwise, the token is lost.
  if (!session && request.nextUrl.pathname.startsWith('/reset-password')) {
     return response;
  }

  // If user is not logged in, and not on an auth page, redirect to login
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  if (!session && !authRoutes.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // if user is logged in, and on an auth page, redirect to dashboard
  if (session && authRoutes.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", request.url));
  }


  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/cron (the cron job route)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
