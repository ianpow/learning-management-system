// /app/api/enrollments/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        user_id: parseInt(session.user.id)
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        progress: {
          select: {
            progress_percentage: true
          }
        }
      }
    })

    const formattedEnrollments = enrollments.map(enrollment => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      progress: enrollment.progress?.progress_percentage || 0,
      enrollment_date: enrollment.enrollment_date
    }))

    return NextResponse.json(formattedEnrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}