// app/api/courses/upload-url/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Update config to use the new segment configuration format
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
// Remove the old config export

export async function POST(request: Request) {
  try {
    const data = await request.arrayBuffer();
    const contentType = request.headers.get('content-type') || 'application/octet-stream';
    const uploadType = request.headers.get('upload-type'); // 'scorm' or 'thumbnail'
    const fileName = request.headers.get('file-name') || 'file';
    
    const pathname = uploadType === 'scorm' 
      ? `/lmscontent/scorm/${fileName}`
      : `/lmscontent/images/${fileName}`;

    const blob = await put(pathname, new Blob([data], { type: contentType }), {
      access: 'public',
      addRandomSuffix: true
    });
    
    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to handle upload' },
      { status: 500 }
    );
  }
}