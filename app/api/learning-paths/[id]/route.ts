// /app/api/learning-paths/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Course {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  completion_status: 'not_started' | 'in_progress' | 'completed';
  is_locked: boolean;
}

interface LearningPathResponse {
  id: number;
  name: string;
  description: string;
  courses: Course[];
  progress: number;
}

interface PathCourse {
  course: {
    id: number;
    title: string;
    description: string;
    duration_minutes: number;
  };
}

interface PathWithCourses {
  id: number;
  name: string;
  description: string;
  courses: PathCourse[];
}

interface CourseProgress {
  course_id: number;
  completion_date: Date | null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pathId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        courses: {
          include: {
            course: true
          },
          orderBy: {
            sequence_order: 'asc'
          }
        }
      }
    }) as PathWithCourses | null;

    if (!path) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    const courseProgress = await prisma.courseEnrollment.findMany({
      where: {
        user_id: userId,
        course_id: {
          in: path.courses.map(pc => pc.course.id)
        }
      }
    }) as CourseProgress[];

    const completedCourses = courseProgress.filter(cp => cp.completion_date).length;
    const progress = (completedCourses / path.courses.length) * 100;

    const response: LearningPathResponse = {
      id: path.id,
      name: path.name,
      description: path.description,
      progress,
      courses: path.courses.map((pc, index) => {
        const userProgress = courseProgress.find(cp => cp.course_id === pc.course.id);
        return {
          id: pc.course.id,
          title: pc.course.title,
          description: pc.course.description,
          duration_minutes: pc.course.duration_minutes,
          is_locked: index > 0 && !courseProgress[index - 1]?.completion_date,
          completion_status: userProgress?.completion_date ? 'completed' :
                           userProgress ? 'in_progress' : 'not_started'
        };
      })
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch learning path details' },
      { status: 500 }
    );
  }
}