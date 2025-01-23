// /app/api/reports/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CoursePopularity {
  title: string;
  _count: {
    enrollments: number;
  };
}

interface ReportData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    completions: number;
  };
  coursePopularity: Array<{
    course: string;
    enrollments: number;
  }>;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const reportType = searchParams.get('reportType');

    // Fetch basic analytics
    const [totalUsers, totalCourses, completions] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.courseEnrollment.count({
        where: {
          completion_date: {
            not: null
          }
        }
      })
    ]);

    // Fetch course popularity data
    const coursePopularity = await prisma.course.findMany({
      select: {
        title: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 5
    }) as CoursePopularity[];

    // Format the response
    const report: ReportData = {
      overview: {
        totalUsers,
        totalCourses,
        completions
      },
      coursePopularity: coursePopularity.map(course => ({
        course: course.title,
        enrollments: course._count.enrollments
      }))
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}