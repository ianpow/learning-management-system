// /app/api/enrollments/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        user_id: parseInt(session.user.id),
        course_id: courseId,
        enrollment_date: new Date(),
        enrollment_type: 'self'
      }
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}