// /app/api/courses/assign/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface AssignmentRequest {
  userIds: number[];
  courseIds: number[];
}

interface AssignmentResponse {
  success: boolean;
  assignedCount: number;
  error?: string;
}

interface CourseEnrollment {
  user_id: number;
  course_id: number;
  enrollment_type: string;
  enrollment_date: Date;
  assigned_by_id: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as AssignmentRequest;
    
    if (!body.userIds?.length || !body.courseIds?.length) {
      return NextResponse.json(
        { error: 'Users and courses are required' },
        { status: 400 }
      );
    }

    // Create enrollments with proper typing
    const enrollmentData: CourseEnrollment[] = body.userIds.flatMap(userId =>
      body.courseIds.map(courseId => ({
        user_id: userId,
        course_id: courseId,
        enrollment_type: 'assigned',
        enrollment_date: new Date(),
        assigned_by_id: parseInt(session.user.id)
      }))
    );

    const enrollments = await Promise.all(
      enrollmentData.map(data =>
        prisma.courseEnrollment.create({
          data
        })
      )
    );

    // Send notifications with proper typing
    const notificationData = body.userIds.flatMap(userId =>
      body.courseIds.map(courseId => ({
        user_id: userId,
        type: 'course_assigned' as const,
        content: `You have been assigned new course(s)`,
        created_at: new Date(),
        created_by_id: parseInt(session.user.id)
      }))
    );

    await Promise.all(
      body.userIds.map(async (userId) => {
        await prisma.notification.createMany({
          data: notificationData.filter(n => n.user_id === userId)
        });
      })
    );

    const response: AssignmentResponse = {
      success: true,
      assignedCount: enrollments.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Course assignment error:', error);
    return NextResponse.json(
      { 
        success: false,
        assignedCount: 0,
        error: 'Failed to assign courses'
      },
      { status: 500 }
    );
  }
}