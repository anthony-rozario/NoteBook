import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const { notebook_id, collaborator_email, permission_level, owner_id } = await req.json();

    // 1. Security Check: Ensure the person making the request actually owns the notebook
    const { data: notebookData, error: nbError } = await supabaseAdmin
      .from('notebooks')
      .select('user_id')
      .eq('id', notebook_id)
      .single();

    if (nbError || !notebookData) {
      return NextResponse.json({ error: 'Notebook not found.' }, { status: 404 });
    }

    if (notebookData.user_id !== owner_id) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this notebook.' }, { status: 403 });
    }

    // 2. Find the collaborator's user_id using their email via Supabase Admin Auth
    const { data: usersList, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;
    
    // Exact match for case insensitivity
    const searchEmail = collaborator_email.toLowerCase().trim();
    const collaborator = usersList.users.find(u => u.email?.toLowerCase() === searchEmail);
    
    if (!collaborator) {
      return NextResponse.json({ error: 'User with this email is not registered on NoteBook.' }, { status: 404 });
    }

    // You cannot share with yourself
    if (collaborator.id === owner_id) {
      return NextResponse.json({ error: 'You are already the owner of this notebook.' }, { status: 400 });
    }

    // 3. Insert the new collaboration record into the database
    const { data: shareData, error: shareError } = await supabaseAdmin
      .from('notebook_collaborators')
      .insert([{ 
         notebook_id: notebook_id, 
         user_id: collaborator.id, 
         permission_level: permission_level 
      }])
      .select()
      .single();

    if (shareError) {
      if (shareError.code === '23505') {
        return NextResponse.json({ error: 'This user is already a collaborator on this notebook.' }, { status: 400 });
      }
      throw shareError;
    }

    return NextResponse.json({ success: true, data: shareData });

  } catch (error: any) {
    console.error("Notebook Share POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
     const { share_id } = await req.json();
     
     if (!share_id) {
        return NextResponse.json({ error: 'Share ID is required.' }, { status: 400 });
     }

     const { error } = await supabaseAdmin
        .from('notebook_collaborators')
        .delete()
        .eq('id', share_id);
        
     if (error) throw error;

     return NextResponse.json({ success: true });
  } catch (error: any) {
     console.error("Notebook Share DELETE Error:", error);
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
