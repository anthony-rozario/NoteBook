// app/api/collaboration/data/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const networkUserIds = new Set<string>();

    // ─── 1. FETCH RAW DATA IN BULK ──────────────────────────────────────────

    // A. My Collabs (Shared WITH me)
    const { data: myCollabs } = await supabase
      .from('page_collaborators')
      .select('page_id, permission_level')
      .eq('user_id', user.id);

    const pageIdsSharedWithMe = myCollabs?.map(c => c.page_id) || [];
    let pagesSharedWithMe: any[] = [];

    if (pageIdsSharedWithMe.length > 0) {
      const { data: pages } = await supabase
        .from('pages')
        .select('id, title, notebook_id, user_id, updated_at')
        .in('id', pageIdsSharedWithMe);
      
      pagesSharedWithMe = pages || [];
      pagesSharedWithMe.forEach(p => networkUserIds.add(p.user_id));
    }

    // B. My Pages (Shared BY me)
    const { data: myPages } = await supabase
      .from('pages')
      .select('id, title, notebook_id')
      .eq('user_id', user.id);

    const myPageIds = myPages?.map(p => p.id) || [];
    let collabsOnMyPages: any[] = [];

    if (myPageIds.length > 0) {
      const { data: collabs } = await supabase
        .from('page_collaborators')
        .select('page_id, user_id, permission_level')
        .in('page_id', myPageIds);
        
      collabsOnMyPages = collabs || [];
      collabsOnMyPages.forEach(c => networkUserIds.add(c.user_id));
    }

    // ─── 2. BULK FETCH ALL USERS (Fixes N+1 Problem) ───────────────────────
    
    networkUserIds.delete(user.id); // Remove the current user from the friends list
    const userMap = new Map();
    const friends: any[] = [];

    if (networkUserIds.size > 0) {
      const { data: networkUsers } = await supabase
        .from('users')
        .select('user_id, name, email')
        .in('user_id', Array.from(networkUserIds));

      if (networkUsers) {
        networkUsers.forEach(u => {
          userMap.set(u.user_id, u); // Map for quick lookup O(1)
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
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600',
      'bg-rose-100 text-rose-600',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-green-100 text-green-600'
    ];

    // Assemble "Shared With Me"
    const sharedWithMe = pagesSharedWithMe.map(page => {
      const collab = myCollabs?.find(c => c.page_id === page.id);
      const owner = userMap.get(page.user_id);
      const ownerName = owner?.name || owner?.email || 'Unknown';

      return {
        id: page.notebook_id,
        pageId: page.id,
        title: page.title || 'Untitled Page',
        sharedBy: ownerName,
        role: (collab?.permission_level || 'viewer') as 'viewer' | 'editor',
        initials: ownerName.slice(0, 2).toUpperCase(),
        color: palette[page.id.charCodeAt(0) % palette.length],
        time: new Date(page.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        path: `/u/notebooks/${page.notebook_id}`,
      };
    });

    // Assemble "Shared By Me"
    const sharedByMe: any[] = [];
    myPages?.forEach(page => {
      const pageCollabs = collabsOnMyPages.filter(c => c.page_id === page.id);
      
      // If no one is collaborating on this page, skip it
      if (pageCollabs.length === 0) return;

      const collabDetails = pageCollabs.map((c, i) => {
        const u = userMap.get(c.user_id);
        const name = u?.name || u?.email || 'U';
        return {
          initials: name.slice(0, 2).toUpperCase(),
          color: palette[i % palette.length],
        };
      });

      sharedByMe.push({
        id: page.notebook_id,
        pageId: page.id,
        title: page.title || 'Untitled Page',
        isPublic: false,
        collaborators: collabDetails,
      });
    });

    return NextResponse.json({ sharedWithMe, sharedByMe, friends });

  } catch (error: any) {
    console.error("Collaboration Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}