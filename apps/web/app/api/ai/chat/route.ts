import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt, history } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    // ── 1. Fetch user's notebooks ───────────────────────────────────────────
    const { data: notebooks } = await supabase
      .from('notebooks')
      .select('id, title, type, has_ai_summary')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

    // ── 2. Fetch recent page content (ocr_text or html content) ────────────
    // Get pages across the 5 most recent notebooks, strip HTML, limit chars
    let pageContext = '';

    if (notebooks && notebooks.length > 0) {
      const recentNbIds = notebooks.slice(0, 5).map(n => n.id);

      const { data: pages } = await supabase
        .from('pages')
        .select('title, content, ocr_text, notebook_id')
        .in('notebook_id', recentNbIds)
        .order('position_index', { ascending: true })
        .limit(30);

      if (pages && pages.length > 0) {
        // Build per-notebook content blocks
        const nbMap = new Map<string, string[]>();
        for (const page of pages) {
          const raw = (page.ocr_text || page.content || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (!raw) continue;
          if (!nbMap.has(page.notebook_id)) nbMap.set(page.notebook_id, []);
          nbMap.get(page.notebook_id)!.push(`[${page.title}]: ${raw.slice(0, 600)}`);
        }

        const nbContextParts: string[] = [];
        for (const nb of notebooks.slice(0, 5)) {
          const pageParts = nbMap.get(nb.id);
          if (pageParts && pageParts.length > 0) {
            nbContextParts.push(
              `📓 Notebook: "${nb.title}" (${nb.type})\n${pageParts.slice(0, 5).join('\n')}`
            );
          } else {
            nbContextParts.push(`📓 Notebook: "${nb.title}" (${nb.type}) — no extracted text yet`);
          }
        }
        pageContext = nbContextParts.join('\n\n');
      }
    }

    // ── 3. Fetch existing AI summaries for extra context ───────────────────
    let summaryContext = '';
    if (notebooks && notebooks.some(n => n.has_ai_summary)) {
      const { data: summaries } = await supabase
        .from('ai_summaries')
        .select('summary_content, notebook_id')
        .in('notebook_id', notebooks.filter(n => n.has_ai_summary).map(n => n.id))
        .limit(3);

      if (summaries && summaries.length > 0) {
        summaryContext = '\n\n## AI Summaries Available:\n' + summaries
          .map(s => {
            const nb = notebooks.find(n => n.id === s.notebook_id);
            return `"${nb?.title}": ${s.summary_content?.slice(0, 400)}`;
          })
          .join('\n');
      }
    }

    // ── 4. Build system prompt with full context ───────────────────────────
    const systemPrompt = `You are NoteBook AI — a smart academic assistant that has READ ACCESS to the user's actual notebook content.

## User's Notebooks & Page Content:
${pageContext || 'No notebook content available yet. User may need to extract text from PDFs first.'}
${summaryContext}

## Your Capabilities:
- Answer questions about the user's notebook content above
- Summarize, explain, and quiz based on their notes
- Help with study strategies, assignments, research
- Generate practice questions from their material
- For PDF notebooks with no extracted text, suggest they use "Extract All Text" in the editor

## Response Guidelines:
- Use markdown: **bold**, bullet lists, code blocks, headings
- Be concise and actionable
- If asked about a specific notebook, reference its actual content above
- If content is missing/empty, tell the user to open that notebook and click "Extract All Text"`;

    // ── 5. Build message array with history ───────────────────────────────
    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history)) {
      messages.push(
        ...history.slice(-12).map((m: any) => ({
          role: m.role,
          content: m.content,
        }))
      );
    }

    messages.push({ role: 'user', content: prompt });

    // ── 6. Call Groq ───────────────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1200,
      temperature: 0.65,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    const msg: string = error?.error?.message || error?.message || 'Unknown error';
    return NextResponse.json({ error: msg }, { status: error?.status || 500 });
  }
}
