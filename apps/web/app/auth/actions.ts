// apps/web/app/auth/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  // Note: Your AuthModal uses name="name", not "full_name"
  const fullName = formData.get('name') as string 

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName, 
        // We set this to false so we know they need to see the modal
        onboarding_complete: false 
      },
    },
  })

  if (error) return { error: error.message }
  redirect('/u')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  redirect('/u')
}

// NEW ACTION: Handles the forced popup form
export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()

  // 1. Get the current user so we have their ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not logged in" }

  // Extract the fields from the frontend form
  const userType = formData.get('userType') as string
  const institution = formData.get('institution') as string
  const course = formData.get('course') as string
  const profession = formData.get('profession') as string
  const company = formData.get('company') as string

  // 2. Update the hidden Auth Metadata (so the modal stops showing!)
  const { error: authError } = await supabase.auth.updateUser({
    data: { onboarding_complete: true }
  })

  if (authError) return { error: authError.message }

  // 3. Save using the CORRECT column names from the actual Supabase schema
  const { error: dbError } = await supabase
    .from('users')
    .update({
      role: userType,
      institution_name: institution || null,
      course_or_class: course || null,
      work_profession: profession || null,
      company_name: company || null,
    })
    .eq('user_id', user.id)

  if (dbError) return { error: dbError.message }

  // Tells Next.js to refresh the layout so the modal disappears
  revalidatePath('/u', 'layout')
  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient();

  // This sends the reset email. 
  // (Make sure your Site URL is configured in your Supabase Dashboard > Authentication > URL Configuration)
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}