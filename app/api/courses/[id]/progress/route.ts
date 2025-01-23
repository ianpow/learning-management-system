// /app/api/courses/[id]/progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProgressUpdate {
  progress: number;
  scormData: {
    score: number;
    timestamp: string;
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const body = await request.json() as ProgressUpdate;

    await prisma.courseProgress.upsert({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId
        }
      },
      update: {
        progress_percentage: body.progress,
        scorm_data: body.scormData,
        last_accessed: new Date()
      },
      create: {
        user_id: userId,
        course_id: courseId,
        progress_percentage: body.progress,
        scorm_data: body.scormData,
        last_accessed: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}