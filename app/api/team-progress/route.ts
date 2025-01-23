// /app/api/team-progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  lastActive: string;
}

interface TeamProgressResponse {
  totalMembers: number;
  totalAssignedCourses: number;
  averageCompletion: number;
  memberProgress: TeamMember[];
  monthlyProgress: Array<{
    month: string;
    completions: number;
    enrollments: number;
  }>;
}

interface CourseEnrollment {
  completion_date: Date | null;
  progress?: {
    progress_percentage: number;
    last_accessed: Date;
  } | null;
}

interface TeamMemberWithEnrollments {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  courseEnrollments: CourseEnrollment[];
}

interface EnrollmentData {
  user_id: number;
  enrollment_date: Date;
  completion_date: Date | null;
}

interface MonthlyData {
  completions: number;
  enrollments: number;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Get team members
    const teamMembers = await prisma.user.findMany({
      where: {
        manager_id: parseInt(session.user.id)
      },
      include: {
        courseEnrollments: {
          include: {
            progress: true
          },
          where: {
            enrollment_date: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined
            }
          }
        }
      }
    }) as TeamMemberWithEnrollments[];

    // Calculate team progress
    const memberProgress: TeamMember[] = teamMembers.map(member => {
      const completedCourses: number = member.courseEnrollments.filter(
        enrollment => enrollment.completion_date
      ).length;

      const inProgressCourses: number = member.courseEnrollments.filter(
        enrollment => !enrollment.completion_date
      ).length;

      const averageProgress: number = member.courseEnrollments.reduce(
        (acc: number, curr: CourseEnrollment) => acc + (curr.progress?.progress_percentage || 0),
        0
      ) / (member.courseEnrollments.length || 1);

      const lastActive: Date = member.courseEnrollments
        .map(e => e.progress?.last_accessed || new Date(0))
        .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];

      return {
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        completedCourses,
        inProgressCourses,
        averageProgress: Math.round(averageProgress),
        lastActive: lastActive.toISOString()
      };
    });

    // Calculate monthly progress
    const monthlyProgress = await generateMonthlyProgress(
      startDate,
      endDate,
      teamMembers.map(m => m.id)
    );

    const response: TeamProgressResponse = {
      totalMembers: teamMembers.length,
      totalAssignedCourses: teamMembers.reduce(
        (acc: number, member: TeamMemberWithEnrollments) => acc + member.courseEnrollments.length,
        0
      ),
      averageCompletion: Math.round(
        memberProgress.reduce((acc: number, member: TeamMember) => acc + member.averageProgress, 0) /
        memberProgress.length
      ),
      memberProgress,
      monthlyProgress
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team progress' },
      { status: 500 }
    );
  }
}

async function generateMonthlyProgress(
  startDate: string | null,
  endDate: string | null,
  teamMemberIds: number[]
): Promise<Array<{ month: string; completions: number; enrollments: number; }>> {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      user_id: {
        in: teamMemberIds
      },
      enrollment_date: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined
      }
    }
  }) as EnrollmentData[];

  const monthlyData = new Map<string, MonthlyData>();

  enrollments.forEach((enrollment: EnrollmentData) => {
    const enrollmentMonth = enrollment.enrollment_date.toISOString().slice(0, 7);
    const completionMonth = enrollment.completion_date?.toISOString().slice(0, 7);

    if (!monthlyData.has(enrollmentMonth)) {
      monthlyData.set(enrollmentMonth, { completions: 0, enrollments: 0 });
    }
    const monthData = monthlyData.get(enrollmentMonth);
    if (monthData) {
      monthData.enrollments++;
    }

    if (completionMonth) {
      if (!monthlyData.has(completionMonth)) {
        monthlyData.set(completionMonth, { completions: 0, enrollments: 0 });
      }
      const completionData = monthlyData.get(completionMonth);
      if (completionData) {
        completionData.completions++;
      }
    }
  });

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      ...data
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}