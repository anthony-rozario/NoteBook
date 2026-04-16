import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We MUST use the Service Role Key here. 
// Why? Because we need to bypass Row Level Security (RLS) just for a moment 
// to look up the user's email and insert the permission record.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const { page_id, collaborator_email, permission_level, owner_id } = await req.json();

    // 1. Security Check: Ensure the person making the request actually owns the notebook
    const { data: pageData, error: pageError } = await supabaseAdmin
      .from('pages')
      .select('notebook_id, notebooks(user_id)')
      .eq('id', page_id)
      .single();

    if (pageError || !pageData) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    // @ts-ignore - nested join typing workaround
    if (pageData.notebooks?.user_id !== owner_id) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this notebook.' }, { status: 403 });
    }

    // 2. Find the collaborator's user_id using their email via Supabase Admin Auth
    const { data: usersList, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;
    
    const collaborator = usersList.users.find(u => u.email === collaborator_email);
    if (!collaborator) {
      return NextResponse.json({ error: 'User with this email is not registered on NoteBook.' }, { status: 404 });
    }

    // 3. Insert the new collaboration record into the database
    const { data: shareData, error: shareError } = await supabaseAdmin
      .from('page_collaborators')
      .insert([{ 
         page_id: page_id, 
         user_id: collaborator.id, 
         permission_level: permission_level 
      }])
      .select()
      .single();

    if (shareError) {
      // Handle the UNIQUE constraint error if they try to invite the same person twice
      if (shareError.code === '23505') {
        return NextResponse.json({ error: 'This user is already a collaborator on this page.' }, { status: 400 });
      }
      throw shareError;
    }

    return NextResponse.json({ success: true, data: shareData });

  } catch (error: any) {
    console.error("Share POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
     const { share_id } = await req.json();
     
     if (!share_id) {
        return NextResponse.json({ error: 'Share ID is required.' }, { status: 400 });
     }

     // Instantly revoke access by deleting the mapping row
     const { error } = await supabaseAdmin
        .from('page_collaborators')
        .delete()
        .eq('id', share_id);
        
     if (error) throw error;

     return NextResponse.json({ success: true });
  } catch (error: any) {
     console.error("Share DELETE Error:", error);
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}