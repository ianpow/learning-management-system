// /app/api/learning-paths/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface LearningPathResponse {
  id: number;
  name: string;
  description: string;
  total_courses: number;
  enrolled_count: number;
  estimated_hours: number;
  completion_percentage?: number;
}

interface PathCourse {
  course: {
    duration_minutes: number | null;
  }
}

interface PathWithRelations {
  id: number;
  name: string;
  description: string;
  courses: PathCourse[];
  enrollments: Array<{
    progress?: number;
  }>;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const paths = await prisma.learningPath.findMany({
      include: {
        courses: {
          include: {
            course: true
          }
        },
        enrollments: {
          where: {
            user_id: parseInt(session.user.id)
          }
        }
      }
    }) as PathWithRelations[];

    const formattedPaths: LearningPathResponse[] = paths.map((path: PathWithRelations) => ({
      id: path.id,
      name: path.name,
      description: path.description,
      total_courses: path.courses.length,
      enrolled_count: path.enrollments.length,
      estimated_hours: path.courses.reduce((total, course) => 
        total + (course.course.duration_minutes || 0), 0) / 60,
      completion_percentage: path.enrollments[0]?.progress || undefined
    }));

    return NextResponse.json(formattedPaths);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    );
  }
}