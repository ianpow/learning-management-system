// app/api/team-progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TeamMemberWithEnrollments {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollments: Array<{
    completion_date: Date | null;
    progress?: {
      progress_percentage: number;
      last_accessed: Date;
    } | null;
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
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const teamMembers = await prisma.user.findMany({
      where: {
        manager_id: parseInt(session.user.id)
      },
      include: {
        enrollments: {
          where: {
            enrollment_date: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined
            }
          },
          include: {
            progress: true
          }
        }
      }
    }) as unknown as TeamMemberWithEnrollments[];

    return NextResponse.json({ teamMembers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team progress' },
      { status: 500 }
    );
  }
}