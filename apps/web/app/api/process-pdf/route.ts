// 1. INLINE POLYFILLS (Put these at the very top!)
if (typeof globalThis.DOMMatrix === 'undefined') (globalThis as any).DOMMatrix = class DOMMatrix {};
if (typeof globalThis.Path2D === 'undefined') (globalThis as any).Path2D = class Path2D {};
if (typeof globalThis.ImageData === 'undefined') (globalThis as any).ImageData = class ImageData {};

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { filePath, notebookId, userId } = await req.json();

    // 2. SAFELY REQUIRE CANVAS AND PDF.JS
    let canvasModule;
    try {
      canvasModule = require('canvas');
    } catch (err) {
      console.error("Canvas Load Error:", err);
      return NextResponse.json({ error: "The Canvas library failed to load. Are you on Windows?" }, { status: 500 });
    }
    const { createCanvas } = canvasModule;

    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = false;

    // 3. Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // 4. Download the raw PDF
    console.log("Downloading PDF for processing...");
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('notebook_files')
      .download(filePath);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Backend could not find the PDF file in Supabase Storage." }, { status: 400 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log("Loading PDF into engine...");
    const pdfDocument = await pdfjsLib.getDocument({
      data: buffer,
      useSystemFonts: true,
      disableFontFace: true,
    }).promise;

    const numPages = pdfDocument.numPages;
    const pagesData = [];

    // 5. Loop through and create images
    console.log(`PDF loaded. Generating ${numPages} images...`);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      
      const viewport = page.getViewport({ scale: 2.0 }); 
      const canvas = createCanvas(viewport.width, viewport.height);
      const canvasContext = canvas.getContext('2d');

      await page.render({
        canvasContext: canvasContext as any,
        viewport: viewport
      }).promise;

      // Convert Canvas to PNG Buffer
      const imageBuffer = canvas.toBuffer('image/png');
      const imageStoragePath = `${userId}/${notebookId}/page_${i}.png`;

      // Upload PNG to Supabase
      const { error: uploadError } = await supabase.storage
        .from('notebook_files')
        .upload(imageStoragePath, imageBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
         console.error(`Failed to upload page ${i}:`, uploadError);
         continue; 
      }

      // Get the public URL for the UI
      const { data: { publicUrl } } = supabase.storage
        .from('notebook_files')
        .getPublicUrl(imageStoragePath);

      // Prepare Database Row
      pagesData.push({
        notebook_id: notebookId,
        user_id: userId,
        title: `Page ${i}`,
        position_index: i,
        image_url: publicUrl,
        content: '', 
        ocr_text: null
      });
    }

    // 6. Insert all pages into the DB
    console.log("Inserting pages into database...");
    const { error: dbError } = await supabase.from('pages').insert(pagesData);
    if (dbError) throw dbError;

    console.log("Processing complete!");
    return NextResponse.json({ success: true, pagesCreated: pagesData.length });

  } catch (error: any) {
    console.error('PDF Processing Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}