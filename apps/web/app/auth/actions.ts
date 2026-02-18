// apps/web/app/auth/actions.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const userType = formData.get('user_type') as string
  
  // New Stage 3 fields
  const phone = formData.get('phone') as string
  const institution = formData.get('institution') as string
  const course = formData.get('course') as string
  const profession = formData.get('profession') as string
  const company = formData.get('company') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName, 
        user_type: userType,
        phone: phone,
        institution: institution,
        course: course,
        profession: profession,
        company: company
      },
    },
  })

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/dashboard')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/dashboard')
}
