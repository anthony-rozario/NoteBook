import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { user } = await createClient().auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    // Fetch context: User's recent notebooks/pages
    const supabase = createClient();
    const { data: notebooks } = await supabase
      .from('notebooks')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const context = `User notebooks: ${notebooks?.map(n => n.title).join(', ') || 'None'}. Respond helpfully to: ${prompt}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are NoteBook AI. Help with notes, summaries, PDFs, MCA studies, code. Be concise & actionable.' },
        { role: 'user', content: context },
      ],
      model: 'llama-3.1-70b-versatile',
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'No response';

    // Optional: Save to ai_chats table (user creates manually in Supabase)
    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}

