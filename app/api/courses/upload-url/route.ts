// app/api/courses/upload-url/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.arrayBuffer();
    const uploadType = request.headers.get('upload-type'); // 'scorm' or 'thumbnail'
    const fileName = request.headers.get('file-name') || 'file';
    
    const pathname = uploadType === 'scorm' 
      ? `/lmscontent/scorm/${fileName}`
      : `/lmscontent/images/${fileName}`;

    const blob = await put(pathname, data, {
      access: 'public',
      addRandomSuffix: true,
      contentType: uploadType === 'scorm' 
        ? 'application/zip'
        : 'image/*'
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