// app/api/courses/upload-url/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Convert the request body stream to a buffer
    const data = await request.arrayBuffer();
    const buffer = Buffer.from(data);

    // Now we can pass the buffer to put
    const blob = await put('temp.zip', buffer, {
      access: 'public',
      addRandomSuffix: true
    });
    
    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to handle upload' }, { status: 500 });
  }
}