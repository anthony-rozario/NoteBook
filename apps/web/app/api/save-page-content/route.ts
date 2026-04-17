// app/api/save-page-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pageId, notebookId, content } = await req.json();
    if (!pageId || !notebookId) {
      return NextResponse.json({ error: 'pageId and notebookId are required' }, { status: 400 });
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Verify the user is owner OR has editor-level access
    const { data: page } = await admin
      .from('pages')
      .select('id, notebook_id, user_id')
      .eq('id', pageId)
      .single();

    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const isOwner = page.user_id === user.id;
    if (!isOwner) {
      // Check notebook-level editor access
      const { data: nbCollab } = await admin
        .from('notebook_collaborators')
        .select('permission_level')
        .eq('notebook_id', page.notebook_id)
        .eq('user_id', user.id)
        .single();

      const hasNbEditor = nbCollab?.permission_level === 'editor';

      if (!hasNbEditor) {
        // Check page-level editor access
        const { data: pageCollab } = await admin
          .from('page_collaborators')
          .select('permission_level')
          .eq('page_id', pageId)
          .eq('user_id', user.id)
          .single();

        if (pageCollab?.permission_level !== 'editor') {
          return NextResponse.json({ error: 'Access denied — viewer cannot edit' }, { status: 403 });
        }
      }
    }

    // 3. Encrypt content before storing
    const encryptedContent = encrypt(content || '');

    // 4. Save encrypted content + update notebook timestamp
    const { error: updateError } = await admin
      .from('pages')
      .update({ content: encryptedContent })
      .eq('id', pageId);

    if (updateError) throw updateError;

    await admin
      .from('notebooks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', notebookId);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Save Page Content Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 });
  }
}
