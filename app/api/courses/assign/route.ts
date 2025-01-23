// /app/api/courses/assign/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notification-service';

interface AssignmentRequest {
  userIds: number[];
  courseIds: number[];
}

interface AssignmentResponse {
  success: boolean;
  assignedCount: number;
  error?: string;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CourseTitle {
  title: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'manager'].includes(session.user.role)) {
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

    // Create enrollments
    const enrollments = await Promise.all(
      body.userIds.flatMap(userId =>
        body.courseIds.map(courseId =>
          prisma.courseEnrollment.create({
            data: {
              user_id: userId,
              course_id: courseId,
              enrollment_type: 'assigned',
              enrollment_date: new Date(),
              assigned_by_id: parseInt(session.user.id)
            }
          })
        )
      )
    );

    // Get course titles for notifications
    const courseTitles = await prisma.course.findMany({
      where: {
        id: { in: body.courseIds }
      },
      select: {
        title: true
      }
    });

    // Send notifications to all assigned users
    await Promise.all(
      body.userIds.map(async (userId) => {
        const assignedBy = session.user.name || 'An administrator';
        
        for (const course of courseTitles) {
          await NotificationService.createCourseAssignmentNotification(
            userId,
            course.title,
            assignedBy
          );
        }
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