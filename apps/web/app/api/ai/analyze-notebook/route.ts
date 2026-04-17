// app/api/ai/analyze-notebook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { notebookId } = await req.json();
    if (!notebookId) return NextResponse.json({ error: 'notebookId is required' }, { status: 400 });

    // 1. Verify notebook ownership
    const { data: notebook, error: nbError } = await supabase
      .from('notebooks')
      .select('id, title, user_id')
      .eq('id', notebookId)
      .single();

    if (nbError || !notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }
    if (notebook.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Initialize Admin Supabase Client to bypass RLS for ai_summaries
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // FIRST: Check if summary already exists, return it if found.
    const { data: existing } = await supabaseAdmin
      .from('ai_summaries')
      .select('summary_content, key_takeaways')
      .eq('notebook_id', notebookId)
      .single();

    if (existing?.key_takeaways) {
      return NextResponse.json({ 
        analysis: {
          summary: existing.summary_content || '',
          ...(existing.key_takeaways as any),
        }
      });
    }

    // 2. Fetch all pages content
    const { data: pages } = await supabase
      .from('pages')
      .select('title, content, ocr_text')
      .eq('notebook_id', notebookId)
      .order('position_index', { ascending: true });

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'Notebook has no pages to analyze.' }, { status: 400 });
    }

    // 3. Build text context from pages (strip HTML tags, combine content)
    const combinedText = pages
      .map((p, i) => {
        const raw = (p.ocr_text || p.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return raw ? `[Page ${i + 1}: ${p.title}]\n${raw}` : null;
      })
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 12000); // Stay within token limits

    if (!combinedText.trim()) {
      return NextResponse.json({ error: 'No text content found in this notebook.' }, { status: 400 });
    }

    // 4. Call Groq for structured analysis
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an academic AI assistant. Analyze the provided notebook content and return a structured JSON response.
          
Return ONLY valid JSON with this exact structure:
{
  "summary": "A comprehensive 2-3 paragraph summary of the notebook content",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4", "takeaway 5"],
  "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "question_paper": [
    {"question": "Question text here?", "type": "short"},
    {"question": "Question text here?", "type": "long"},
    {"question": "Which of the following is correct?", "type": "mcq"}
  ]
}

Generate 5 key takeaways, 4-6 topics, and 8-10 questions (mix of short, long, and mcq types).`,
        },
        {
          role: 'user',
          content: `Analyze this notebook titled "${notebook.title}":\n\n${combinedText}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    let analysis: any;

    try {
      analysis = JSON.parse(rawContent);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }

    // 5. Upsert into ai_summaries table (using Admin client to bypass RLS)
    const summaryPayload = {
      notebook_id: notebookId,
      summary_content: analysis.summary || '',
      key_takeaways: {
        key_takeaways: analysis.key_takeaways || [],
        topics: analysis.topics || [],
        question_paper: analysis.question_paper || [],
      },
    };

    const { error: upsertError } = await supabaseAdmin
      .from('ai_summaries')
      .upsert(summaryPayload, { onConflict: 'notebook_id' });

    if (upsertError) {
      console.error('Upsert ai_summaries error:', upsertError);
      // Non-fatal: still return the analysis even if save fails
    }

    // 6. Mark notebook as analyzed
    await supabase
      .from('notebooks')
      .update({ has_ai_summary: true })
      .eq('id', notebookId);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Analyze Notebook Error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
