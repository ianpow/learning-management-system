// app/api/learning-paths/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface PathFromDB {
  id: number;
  title: string;
  description: string;
  courses: Array<{
    course: {
      id: number;
      title: string;
      duration_minutes: number;
    };
    courseEnrollments: Array<{
      completion_date: Date | null;
    }>;
  }>;
 }

interface CourseWithStatus {
 id: number;
 title: string;
 duration_minutes: number;
 completion_status: 'not_started' | 'in_progress' | 'completed';
}

interface LearningPath {
 id: number;
 title: string;
 description: string;
 courses: CourseWithStatus[];
 progress: number;
}

export async function GET() {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const paths = await prisma.learningPath.findMany({
   include: {
     courses: {
       include: {
         course: true,
         courseEnrollments: {
           where: {
             user_id: parseInt(session.user.id)
           }
         }
       }
     }
   }
 });

 const formattedPaths: LearningPath[] = paths.map((path: PathFromDB) => {
  const coursesWithStatus = path.courses.map((pc: PathFromDB['courses'][0]) => {
    const enrollment = pc.courseEnrollments[0];
    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    
    if (enrollment?.completion_date) {
      status = 'completed';
    } else if (enrollment) {
      status = 'in_progress';
    }
 
    return {
      id: pc.course.id,
      title: pc.course.title,
      duration_minutes: pc.course.duration_minutes,
      completion_status: status
    };
  });
 
  const completedCourses = coursesWithStatus.filter(
    (c: CourseWithStatus) => c.completion_status === 'completed'
  ).length;
  const progress = Math.round((completedCourses / coursesWithStatus.length) * 100);
 
  return {
    id: path.id,
    title: path.title,
    description: path.description,
    courses: coursesWithStatus,
    progress
  };
 }); 

 return NextResponse.json(formattedPaths);
}