// /app/api/courses/[id]/complete/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notification-service';

interface CourseWithTitle {
  title: string;
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

    // Update enrollment and progress
    await Promise.all([
      prisma.courseEnrollment.update({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: courseId
          }
        },
        data: {
          completion_date: new Date()
        }
      }),
      prisma.courseProgress.update({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: courseId
          }
        },
        data: {
          progress_percentage: 100,
          last_accessed: new Date()
        }
      })
    ]);

    // Get course title for notification
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true }
    }) as CourseWithTitle | null;

    if (course) {
      await NotificationService.createCourseCompletionNotification(
        userId,
        course.title
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark course as complete' },
      { status: 500 }
    );
  }
}