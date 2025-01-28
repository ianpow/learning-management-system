// /app/api/enrollments/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestData = await request.json();
    console.log('Request data:', requestData); // Debug log

    if (!requestData.courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: parseInt(session.user.id),
          course_id: requestData.courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        user_id: parseInt(session.user.id),
        course_id: requestData.courseId,
        enrollment_date: new Date(),
        enrollment_type: 'self'
      }
    });

    console.log('Created enrollment:', enrollment); // Debug log
    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Enrollment error details:', error); // Detailed error log
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}