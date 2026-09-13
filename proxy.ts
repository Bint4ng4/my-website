import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


const isPublicRoute = createRouteMatcher(['/' ,'/sign-in(.*)', '/monitoring(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and this app's public asset directories only
    '/((?!_next|favicon\\.ico$|icons/|images/|readme/).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};