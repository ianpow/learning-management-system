// /app/api/courses/[id]/content/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CourseContent {
  id: number;
  title: string;
  scorm_package_url: string;
  current_progress: number;
}

export async function GET(
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

    const [course, progress] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          scorm_package_url: true
        }
      }),
      prisma.courseProgress.findUnique({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: courseId
          }
        },
        select: {
          progress_percentage: true
        }
      })
    ]);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const response: CourseContent = {
      id: course.id,
      title: course.title,
      scorm_package_url: course.scorm_package_url,
      current_progress: progress?.progress_percentage || 0
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch course content' },
      { status: 500 }
    );
  }
}