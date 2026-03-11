// apps/web/actions/notebook.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createNotebook(formData: FormData) {
  const supabase = await createClient();

  // 1. Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("You must be logged in to create a notebook.");
  }

  // 2. Extract data from the form
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  // 3. Insert into Supabase
  const { data, error } = await supabase
    .from("notebooks")
    .insert([
      {
        user_id: user.id,
        title,
        description,
        category: category || null, // Handle empty categories
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating notebook:", error);
    throw new Error("Failed to create notebook.");
  }

  // 4. Tell Next.js to refresh the dashboard and notebooks pages so the new data shows instantly
  revalidatePath("/u");
  revalidatePath("/u/notebooks");

  return data;
}