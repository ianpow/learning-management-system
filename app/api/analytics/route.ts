// /app/api/analytics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Sample analytics data (replace with actual database queries)
    const analyticsData = {
      overview: {
        totalUsers: await prisma.user.count(),
        activeUsers: 0, // implement actual count
        completedCourses: await prisma.courseEnrollment.count({
          where: {
            completion_date: { not: null }
          }
        }),
        averageProgress: 0, // implement actual calculation
        certificatesIssued: await prisma.certificate.count()
      },
      // Add other analytics data...
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}