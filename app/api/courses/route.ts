// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/file-upload';

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