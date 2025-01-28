// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/file-upload';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail_url: true,
        duration_minutes: true,
        scorm_package_url: true,
        is_mandatory: true,
        department: {
          select: {
            name: true
          }
        },
        created_by: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('scormPackage') as File;
  const data = JSON.parse(formData.get('data') as string);

  const fileUrl = await uploadFile(file);

  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      department_id: parseInt(data.department),
      is_mandatory: data.isMandatory,
      scorm_package_url: fileUrl,
      created_by_id: parseInt(session.user.id)
    }
  });

  return NextResponse.json(course);
}