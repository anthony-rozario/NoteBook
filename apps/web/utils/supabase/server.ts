// apps/web/utils/supabase/server.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // Await the cookies object (required in Next.js 15+)
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // NEW: Fetch all cookies at once
        getAll() {
          return cookieStore.getAll()
        },
        // NEW: Set multiple cookies at once
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This is completely safe to ignore because your middleware 
            // handles refreshing the user's session!
          }
        },
      },
    }
  )
}