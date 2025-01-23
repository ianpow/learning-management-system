// /app/api/courses/upload-scorm/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

interface UploadResponse {
  fileUrl: string;
  success: boolean;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`scorm/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: 'application/zip'
    });

    const response: UploadResponse = {
      fileUrl: blob.url,
      success: true
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload SCORM package' 
      },
      { status: 500 }
    );
  }
}