// app/api/learning-paths/route.ts
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

    const paths = await prisma.learningPath.findMany({
      include: {
        courses: {
          include: {
            course: true
          }
        }
      }
    })

    // Get user's progress for each path
    const pathsWithProgress = await Promise.all(paths.map(async (path) => {
      const courseIds = path.courses.map(pc => pc.course_id)
      
      const completedCourses = await prisma.courseEnrollment.count({
        where: {
          user_id: parseInt(session.user.id),
          course_id: { in: courseIds },
          completion_date: { not: null }
        }
      })

      const progress = path.courses.length > 0
        ? Math.round((completedCourses / path.courses.length) * 100)
        : 0

      return {
        id: path.id,
        name: path.name,
        description: path.description,
        total_courses: path.courses.length,
        progress
      }
    }))

    return NextResponse.json(pathsWithProgress)
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    )
  }
}