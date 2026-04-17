// app/api/add-page/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { notebookId } = await req.json();
    if (!notebookId) return NextResponse.json({ error: 'notebookId is required' }, { status: 400 });

    // Verify ownership
    const { data: notebook } = await supabase
      .from('notebooks')
      .select('id, user_id')
      .eq('id', notebookId)
      .single();

    if (!notebook || notebook.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the current max position_index for this notebook
    const { data: lastPage } = await supabase
      .from('pages')
      .select('position_index')
      .eq('notebook_id', notebookId)
      .order('position_index', { ascending: false })
      .limit(1)
      .single();

    const nextIndex = (lastPage?.position_index ?? 0) + 1;

    // Insert the new page
    const { data: newPage, error: insertError } = await supabase
      .from('pages')
      .insert({
        notebook_id: notebookId,
        user_id: user.id,
        title: `Page ${nextIndex}`,
        content: '',
        position_index: nextIndex,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update the notebook's updated_at timestamp
    await supabase
      .from('notebooks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', notebookId);

    return NextResponse.json({ page: newPage });
  } catch (error: any) {
    console.error('Add Page Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add page' }, { status: 500 });
  }
}
