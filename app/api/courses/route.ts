// app/api/courses/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'  // Updated import path
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CourseData {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  enrollments: any[]; // You can make this more specific based on your Prisma types
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      include: {
        enrollments: {
          where: {
            user_id: parseInt(session.user.id)
          },
          include: {
            progress: true
          }
        }
      }
    })

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      duration_minutes: course.duration_minutes,
      enrolled_count: course.enrollments.length,
      is_enrolled: course.enrollments.length > 0,
      progress: course.enrollments[0]?.progress?.progress_percentage || 0
    }))

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}