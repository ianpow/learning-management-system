import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse('File must be an image', { status: 400 });
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse('File size must be less than 5MB', { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`profile-images/${session.user.email}/${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    });

    // Update user profile in database
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        profileImage: blob.url || null
      },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new NextResponse('Error uploading image', { status: 500 });
  }
}