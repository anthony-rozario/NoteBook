// app/api/notebook-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate the requesting user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notebookId = searchParams.get('notebookId');
    if (!notebookId) {
      return NextResponse.json({ error: 'notebookId is required' }, { status: 400 });
    }

    // 2. Use admin client to bypass RLS
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fetch the notebook
    const { data: notebook, error: nbError } = await admin
      .from('notebooks')
      .select('*')
      .eq('id', notebookId)
      .single();

    if (nbError || !notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    // 4. Determine access level
    const isOwner = notebook.user_id === user.id;
    let permissionLevel: 'owner' | 'editor' | 'viewer' = 'owner';
    let allowedPageIds: string[] | null = null; // null = all pages

    if (!isOwner) {
      // Check notebook-level collaboration first
      const { data: nbCollab } = await admin
        .from('notebook_collaborators')
        .select('permission_level')
        .eq('notebook_id', notebookId)
        .eq('user_id', user.id)
        .single();

      if (nbCollab) {
        // User has notebook-level access — can see all pages
        permissionLevel = nbCollab.permission_level as 'editor' | 'viewer';
        allowedPageIds = null; // all pages
      } else {
        // Check page-level collaboration
        const { data: pageCollabs } = await admin
          .from('page_collaborators')
          .select('page_id, permission_level')
          .eq('user_id', user.id);

        // Filter only pages that belong to this notebook
        if (pageCollabs && pageCollabs.length > 0) {
          // Fetch all pages of this notebook to verify page_id belongs here
          const { data: allPages } = await admin
            .from('pages')
            .select('id')
            .eq('notebook_id', notebookId);

          const notebookPageIds = new Set((allPages || []).map((p: any) => p.id));
          const myPageCollabs = pageCollabs.filter(c => notebookPageIds.has(c.page_id));

          if (myPageCollabs.length === 0) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          // Use the most restrictive permission across shared pages
          const hasEditor = myPageCollabs.some(c => c.permission_level === 'editor');
          permissionLevel = hasEditor ? 'editor' : 'viewer';
          allowedPageIds = myPageCollabs.map(c => c.page_id);
        } else {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
    }

    // 5. Fetch pages — scoped to what the user is allowed to see
    let pagesQuery = admin
      .from('pages')
      .select('*')
      .eq('notebook_id', notebookId)
      .order('position_index', { ascending: true });

    if (allowedPageIds !== null) {
      pagesQuery = pagesQuery.in('id', allowedPageIds);
    }

    const { data: pages, error: pagesError } = await pagesQuery;
    if (pagesError) throw pagesError;

    const decryptedPages = (pages || []).map((p: any) => ({
      ...p,
      content: p.content ? decrypt(p.content) : p.content,
      ocr_text: p.ocr_text ? decrypt(p.ocr_text) : p.ocr_text,
    }));

    return NextResponse.json({
      notebook,
      pages: decryptedPages,
      permissionLevel, // 'owner' | 'editor' | 'viewer'
    });
  } catch (error: any) {
    console.error('Notebook Data API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
