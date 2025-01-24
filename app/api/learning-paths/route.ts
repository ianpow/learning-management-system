// app/api/learning-paths/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface PrismaCourse {
 id: number;
 title: string;
 duration_minutes: number;
}

interface PrismaEnrollment {
 completion_date: Date | null;
}

interface PathCourse {
 course: PrismaCourse;
 enrollments: PrismaEnrollment[];
}

interface DbLearningPath {
 id: number;
 name: string;
 description: string;
 courses: PathCourse[];
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
         enrollments: {
           where: {
             user_id: parseInt(session.user.id)
           }
         }
       }
     }
   }
 }) as DbLearningPath[];

 const formattedPaths = paths.map((path: DbLearningPath) => {
   const coursesWithStatus = path.courses.map((pc: PathCourse) => {
     let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
     
     if (pc.enrollments?.length > 0) {
       status = pc.enrollments[0].completion_date ? 'completed' : 'in_progress';
     }

     return {
       id: pc.course.id,
       title: pc.course.title,
       duration_minutes: pc.course.duration_minutes,
       completion_status: status
     };
   });

   const completedCourses = coursesWithStatus.filter((c: CourseWithStatus) => 
     c.completion_status === 'completed'
   ).length;
   
   const progress = coursesWithStatus.length > 0 
     ? Math.round((completedCourses / coursesWithStatus.length) * 100)
     : 0;

   return {
     id: path.id,
     title: path.name,
     description: path.description,
     courses: coursesWithStatus,
     progress
   };
 });

 return NextResponse.json(formattedPaths);
}