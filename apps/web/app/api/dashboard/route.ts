// app/api/dashboard/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ── Recent notebooks ───────────────────────────────────────────────────────
  const { data: recentNotebooks } = await supabase
    .from('notebooks')
    .select('id, title, type, updated_at, has_ai_summary, description')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(4);

  const notebookCount = recentNotebooks?.length ?? 0;

  // Total count (for usage bar)
  const { count: totalCount } = await supabase
    .from('notebooks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // ── AI Insights (latest summaries for my notebooks) ───────────────────────
  const myNotebookIds = recentNotebooks?.map((n) => n.id) ?? [];
  let aiInsights: any[] = [];

  if (myNotebookIds.length > 0) {
    const { data: summaries } = await supabase
      .from('ai_summaries')
      .select('id, notebook_id, summary_content, key_takeaways, created_at')
      .in('notebook_id', myNotebookIds)
      .order('created_at', { ascending: false })
      .limit(3);

    if (summaries) {
      aiInsights = summaries.map((s) => {
        const nb = recentNotebooks?.find((n) => n.id === s.notebook_id);
        return {
          ...s,
          notebookTitle: nb?.title ?? 'Notebook',
        };
      });
    }
  }

  // ── Real network: users who collaborated on my pages ─────────────────────
  const { data: myPages } = await supabase
    .from('pages')
    .select('id')
    .eq('user_id', user.id);

  const pageIds = myPages?.map((p) => p.id) ?? [];
  let networkUsers: any[] = [];

  if (pageIds.length > 0) {
    const { data: collabs } = await supabase
      .from('page_collaborators')
      .select('user_id, permission_level, created_at')
      .in('page_id', pageIds)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (collabs) {
      // Deduplicate by user_id, keep latest
      const seen = new Map<string, (typeof collabs)[0]>();
      for (const c of collabs) {
        if (!seen.has(c.user_id)) seen.set(c.user_id, c);
      }

      for (const [uid, c] of [...seen.entries()].slice(0, 4)) {
        const { data: u } = await supabase
          .from('users')
          .select('user_id, name, email')
          .eq('user_id', uid)
          .single();

        if (u) {
          const displayName = u.name || u.email || 'Unknown';
          const secondsAgo = Math.floor(
            (Date.now() - new Date(c.created_at).getTime()) / 1000
          );
          let timeLabel = 'just now';
          if (secondsAgo > 86400) timeLabel = `${Math.floor(secondsAgo / 86400)}d ago`;
          else if (secondsAgo > 3600) timeLabel = `${Math.floor(secondsAgo / 3600)}h ago`;
          else if (secondsAgo > 60) timeLabel = `${Math.floor(secondsAgo / 60)}m ago`;

          networkUsers.push({
            id: u.user_id,
            name: displayName,
            initials: displayName.slice(0, 2).toUpperCase(),
            action: c.permission_level === 'editor' ? `edited ${timeLabel}` : `viewed ${timeLabel}`,
          });
        }
      }
    }
  }

  return NextResponse.json({
    recentNotebooks: recentNotebooks ?? [],
    aiInsights,
    networkUsers,
    workspaceUsage: {
      used: totalCount ?? 0,
      limit: 20,
    },
  });
}
