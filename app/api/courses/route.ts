// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CourseCreate {
  title: string;
  description: string;
  is_mandatory: boolean;
  department_id: string;
  scorm_package_url: string;
}

interface CourseResponse {
  success: boolean;
  courseId?: number;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as CourseCreate;

    // Validate required fields
    if (!body.title || !body.description || !body.scorm_package_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        is_mandatory: body.is_mandatory,
        department_id: parseInt(body.department_id),
        scorm_package_url: body.scorm_package_url,
        created_by_id: parseInt(session.user.id),
        status: 'active'
      }
    });

    const response: CourseResponse = {
      success: true,
      courseId: course.id
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create course' 
      },
      { status: 500 }
    );
  }
}