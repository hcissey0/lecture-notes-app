// import { NextRequest, NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();

//   // Create a Supabase client configured to use cookies
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get: (name) => req.cookies.get(name)?.value,
//         set: (name, value, options) => {
//           res.cookies.set({ name, value, ...options });
//         },
//         remove: (name, options) => {
//           res.cookies.set({ name, value: "", ...options });
//         },
//       },
//     }
//   );

//   // Refresh session if expired - required for Server Components
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // Check the requested path
//   const path = req.nextUrl.pathname;

//   // Paths that require authentication
//   const protectedPaths = ["/u", "/u/note", "/u/settings"];

//   // Check if the path is protected and user is not authenticated
//   const isProtectedPath = protectedPaths.some((prefix) =>
//     path.startsWith(prefix)
//   );

// //   if (!session) return NextResponse.redirect(new URL('/auth', req.url))

//   if (isProtectedPath && !session) {
//     // Redirect unauthenticated users to the login page
//     const redirectUrl = new URL("/auth", req.url);
//     // You can also add a redirect parameter to return to the original page after login
//     redirectUrl.searchParams.set("redirect", path);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // If user is authenticated and trying to access auth page, redirect to dashboard
//   if (session && path.startsWith("/auth")) {
//     return NextResponse.redirect(new URL("/u", req.url));
//   }

//   return res;
// }

// // Run middleware on these paths
// export const config = {
//   matcher: ["/u/:path*", "/auth/:path*"],
// };
