// 1. THIS MUST BE THE VERY FIRST LINE
import './polyfills';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import pdf from 'pdf-parse'; // Back to a beautiful, standard import!

export async function POST(req: Request) {
  try {
    const { filePath, notebookId, userId } = await req.json();

    // 2. Initialize Supabase Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // 3. Download File
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('notebook_files')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Supabase Download Error:", downloadError);
      return NextResponse.json({ error: "Backend could not find the file in Storage." }, { status: 400 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Extract Text (Will work flawlessly now!)
    const data = await pdf(buffer);
    const fullText = data.text;

    if (!fullText || fullText.trim() === '') {
       return NextResponse.json({ error: "No text found in this PDF." }, { status: 400 });
    }

    // 5. Split into Pages
    const chunkSize = 1500;
    const pages = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
      pages.push(fullText.substring(i, i + chunkSize));
    }

    // 6. Insert to DB
    const insertData = pages.map((pageText: string, index: number) => {
      const formattedHtml = pageText
        .split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string) => `<p>${line.trim()}</p>`)
        .join('');

      return {
        notebook_id: notebookId,
        user_id: userId,
        title: `Page ${index + 1}`,
        position_index: index + 1,
        content: formattedHtml
      };
    });

    const { error: dbError } = await supabase.from('pages').insert(insertData);

    if (dbError) {
      console.error("Database Insert Error:", dbError);
      return NextResponse.json({ error: "Failed to save extracted pages to the database." }, { status: 500 });
    }

    return NextResponse.json({ success: true, pagesCreated: pages.length });

  } catch (error: any) {
    console.error('PDF Extraction API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 