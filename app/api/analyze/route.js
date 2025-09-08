import { NextResponse } from 'next/server';
import { analyzeBase64Image } from '../../../lib/geminiClient';

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Allow', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(null, { status: 204, headers });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimetype = file.type || 'image/jpeg';

    const analysis = await analyzeBase64Image(base64, mimetype);
    return NextResponse.json(analysis, { status: 200 });
  } catch (e) {
    const message = e?.message || 'Failed to analyze image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


