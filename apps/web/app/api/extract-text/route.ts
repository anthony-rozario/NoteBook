// app/api/extract-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });

    // Use Groq with vision capabilities to extract and format text from the image
    // Groq's llama-3.2-11b-vision-preview supports image inputs
    let html = '';
    
    try {
      const completion = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract ALL text from this image accurately. Format it as clean HTML for a rich text editor:
                - Use <h1>, <h2>, <h3> for headings
                - Use <p> for paragraphs  
                - Use <ul><li> for bullet points
                - Use <ol><li> for numbered lists
                - Use <strong> for bold text
                - Use <em> for italic text
                - Preserve the document structure exactly as visible
                - Return ONLY the HTML, no explanation or markdown code blocks`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.1,
      });

      html = completion.choices[0]?.message?.content || '';
      // Strip any accidental markdown code fences
      html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
    } catch (visionError: any) {
      // If vision model fails (e.g., unsupported URL), return a placeholder
      console.error('Vision extraction failed:', visionError);
      html = `<p><em>Text extraction failed for this page. The image may not be accessible to the AI. Please type or paste the content manually.</em></p>`;
    }

    // Ensure we have some HTML
    if (!html || !html.includes('<')) {
      html = `<p>${html}</p>`;
    }

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error('Extract Text Error:', error);
    return NextResponse.json({ error: error.message || 'Extraction failed' }, { status: 500 });
  }
}
