import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });

    // Use Groq vision to extract text directly from the image URL
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this image. Format as clean HTML using <h1>-<h3>, <p>, <ul>/<li>, <strong>, <em>. Return ONLY the HTML.',
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    });

    let html = completion.choices[0]?.message?.content || '';
    html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
    if (!html.includes('<')) html = `<p>${html}</p>`;

    return NextResponse.json({ html });

  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
