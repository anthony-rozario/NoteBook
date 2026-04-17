// app/api/collaboration/data/route.ts
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const networkUserIds = new Set<string>();

    // ─── 1. FETCH RAW DATA IN BULK ──────────────────────────────────────────

    // A. Shared WITH me (Pages)
    const { data: myPageCollabs } = await supabaseAdmin
      .from('page_collaborators')
      .select('page_id, permission_level')
      .eq('user_id', user.id);

    const pageIdsSharedWithMe = myPageCollabs?.map(c => c.page_id) || [];
    let pagesSharedWithMe: any[] = [];
    if (pageIdsSharedWithMe.length > 0) {
      const { data: pages } = await supabaseAdmin
        .from('pages')
        .select('id, title, notebook_id, user_id, updated_at')
        .in('id', pageIdsSharedWithMe);
      pagesSharedWithMe = pages || [];
      pagesSharedWithMe.forEach(p => networkUserIds.add(p.user_id));
    }

    // B. Shared WITH me (Notebooks)
    const { data: myNbCollabs } = await supabaseAdmin
      .from('notebook_collaborators')
      .select('notebook_id, permission_level')
      .eq('user_id', user.id);

    const nbIdsSharedWithMe = myNbCollabs?.map(c => c.notebook_id) || [];
    let notebooksSharedWithMe: any[] = [];
    if (nbIdsSharedWithMe.length > 0) {
      const { data: notebooks } = await supabaseAdmin
        .from('notebooks')
        .select('id, title, user_id, updated_at')
        .in('id', nbIdsSharedWithMe);
      notebooksSharedWithMe = notebooks || [];
      notebooksSharedWithMe.forEach(n => networkUserIds.add(n.user_id));
    }

    // C. Shared BY me (My Pages)
    const { data: myPages } = await supabaseAdmin
      .from('pages')
      .select('id, title, notebook_id')
      .eq('user_id', user.id);

    const myPageIds = myPages?.map(p => p.id) || [];
    let collabsOnMyPages: any[] = [];
    if (myPageIds.length > 0) {
      const { data: collabs } = await supabaseAdmin
        .from('page_collaborators')
        .select('page_id, user_id, permission_level')
        .in('page_id', myPageIds);
      collabsOnMyPages = collabs || [];
      collabsOnMyPages.forEach(c => networkUserIds.add(c.user_id));
    }

    // D. Shared BY me (My Notebooks)
    const { data: myNotebooks } = await supabaseAdmin
      .from('notebooks')
      .select('id, title')
      .eq('user_id', user.id);

    const myNbIds = myNotebooks?.map(n => n.id) || [];
    let collabsOnMyNbs: any[] = [];
    if (myNbIds.length > 0) {
      const { data: collabs } = await supabaseAdmin
        .from('notebook_collaborators')
        .select('notebook_id, user_id, permission_level')
        .in('notebook_id', myNbIds);
      collabsOnMyNbs = collabs || [];
      collabsOnMyNbs.forEach(c => networkUserIds.add(c.user_id));
    }

    // ─── 2. BULK FETCH ALL USERS (Fixes N+1 Problem) ───────────────────────
    
    networkUserIds.delete(user.id);
    const userMap = new Map();
    const friends: any[] = [];

    if (networkUserIds.size > 0) {
      const { data: networkUsers } = await supabaseAdmin
        .from('users')
        .select('user_id, name, email')
        .in('user_id', Array.from(networkUserIds));

      if (networkUsers) {
        networkUsers.forEach(u => {
          userMap.set(u.user_id, u);
          friends.push({
            id: u.user_id,
            name: u.name || u.email || 'Unknown',
            email: u.email,
            initials: (u.name || u.email || 'U').slice(0, 2).toUpperCase(),
          });
        });
      }
    }

    // ─── 3. ASSEMBLE FINAL JSON PAYLOAD ────────────────────────────────────

    const palette = [
      'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600',
      'bg-rose-100 text-rose-600', 'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600', 'bg-green-100 text-green-600'
    ];

    const sharedWithMe: any[] = [];

    // Add Shared Pages
    pagesSharedWithMe.forEach(page => {
      const collab = myPageCollabs?.find(c => c.page_id === page.id);
      const owner = userMap.get(page.user_id);
      const ownerName = owner?.name || owner?.email || 'Unknown';
      sharedWithMe.push({
        id: page.id,
        notebookId: page.notebook_id,
        pageId: page.id,
        type: 'page',
        title: page.title || 'Untitled Page',
        sharedBy: ownerName,
        role: (collab?.permission_level || 'viewer') as 'viewer' | 'editor',
        initials: ownerName.slice(0, 2).toUpperCase(),
        color: palette[page.id.charCodeAt(0) % palette.length] || palette[0],
        time: new Date(page.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        path: `/u/notebooks/${page.notebook_id}?page=${page.id}`,
      });
    });

    // Add Shared Notebooks
    notebooksSharedWithMe.forEach(notebook => {
      const collab = myNbCollabs?.find(c => c.notebook_id === notebook.id);
      const owner = userMap.get(notebook.user_id);
      const ownerName = owner?.name || owner?.email || 'Unknown';
      sharedWithMe.push({
        id: notebook.id,
        notebookId: notebook.id,
        pageId: null,
        type: 'notebook',
        title: notebook.title || 'Untitled Notebook',
        sharedBy: ownerName,
        role: (collab?.permission_level || 'viewer') as 'viewer' | 'editor',
        initials: ownerName.slice(0, 2).toUpperCase(),
        color: palette[notebook.id.charCodeAt(0) % palette.length] || palette[2],
        time: new Date(notebook.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        path: `/u/notebooks/${notebook.id}`,
      });
    });

    const sharedByMe: any[] = [];

    // Add Shared By Me Pages
    myPages?.forEach(page => {
      const pageCollabs = collabsOnMyPages.filter(c => c.page_id === page.id);
      if (pageCollabs.length === 0) return;

      const collabDetails = pageCollabs.map((c, i) => {
        const u = userMap.get(c.user_id);
        const name = u?.name || u?.email || 'U';
        return {
          name: name,
          email: u?.email || 'Unknown',
          role: c.permission_level,
          initials: name.slice(0, 2).toUpperCase(),
          color: palette[i % palette.length],
        };
      });

      sharedByMe.push({
        id: page.id,
        notebookId: page.notebook_id,
        pageId: page.id,
        type: 'page',
        title: page.title || 'Untitled Page',
        isPublic: false,
        collaborators: collabDetails,
        path: `/u/notebooks/${page.notebook_id}?page=${page.id}`,
      });
    });

    // Add Shared By Me Notebooks
    myNotebooks?.forEach(notebook => {
      const nbCollabs = collabsOnMyNbs.filter(c => c.notebook_id === notebook.id);
      if (nbCollabs.length === 0) return;

      const collabDetails = nbCollabs.map((c, i) => {
        const u = userMap.get(c.user_id);
        const name = u?.name || u?.email || 'U';
        return {
          name: name,
          email: u?.email || 'Unknown',
          role: c.permission_level,
          initials: name.slice(0, 2).toUpperCase(),
          color: palette[i % palette.length],
        };
      });

      sharedByMe.push({
        id: notebook.id,
        notebookId: notebook.id,
        pageId: null,
        type: 'notebook',
        title: notebook.title || 'Untitled Notebook',
        isPublic: false,
        collaborators: collabDetails,
        path: `/u/notebooks/${notebook.id}`,
      });
    });

    // Sort by latest interactions
    sharedWithMe.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ sharedWithMe, sharedByMe, friends });

  } catch (error: any) {
    console.error("Collaboration Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}