// apps/web/middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
 console.log("🛑 MIDDLEWARE RAN FOR:", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // NEW: Using getAll instead of get
        getAll() {
          return request.cookies.getAll()
        },
        // NEW: Using setAll instead of set and remove
        setAll(cookiesToSet) {
          // 1. Update the request cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // 2. Re-create the response to apply the updated request
          response = NextResponse.next({
            request,
          })
          
          // 3. Update the response cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verify the user's session
  const { data: { user } } = await supabase.auth.getUser()

  // Protected route logic
  console.log("👤 SUPABASE USER:", user ? "LOGGED IN" : "NOT LOGGED IN");

  if (!user && request.nextUrl.pathname.startsWith('/u')) {
    console.log("🥾 KICKING USER OUT!");
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}