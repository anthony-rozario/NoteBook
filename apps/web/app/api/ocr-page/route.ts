import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });

    // 1. Download image from Supabase public URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    const buffer = Buffer.from(await response.arrayBuffer());

    // 2. Tesseract OCR for base text
    const { data: { text } } = await import('tesseract.js').then(tesseract => tesseract.recognize(buffer, 'eng', {
      logger: m => console.log(m)
    }));

    if (!text.trim()) throw new Error('No text detected in image');

    // 3. Groq to format as TipTap HTML (headings, lists, paragraphs)
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Convert this OCR text to clean TipTap/Prose HTML. Use <h1>-<h3>, <p>, <ul>/<li>, <strong>, <blockquote>. Keep meaning/structure. No extra text.' },
        { role: 'user', content: text }
      ],
      model: 'llama3-8b-8192',
      max_tokens: 2000,
      temperature: 0.1
    });

    const html = completion.choices[0]?.message?.content || `<p>${text.slice(0,500)}...</p>`;

    return NextResponse.json({ html, rawText: text });

  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
