// /app/api/courses/access-control/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

interface AccessControlData {
  departments: number[];
  roles: number[];
  locations: number[];
}

type CourseAccessRecord = {
  id: number;
  course_id: number;
  department_id: number | null;
  role_id: number | null;
  location_id: number | null;
  type: 'DEPARTMENT' | 'ROLE' | 'LOCATION';
  created_at: Date;
  updated_at: Date;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid course ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const accessControl = await prisma.$queryRaw<CourseAccessRecord[]>`
      SELECT * FROM "CourseAccess"
      WHERE course_id = ${courseId}
    `;

    const formattedAccess = {
      departments: accessControl
        .filter(ac => ac.type === 'DEPARTMENT')
        .map(ac => ac.department_id),
      roles: accessControl
        .filter(ac => ac.type === 'ROLE')
        .map(ac => ac.role_id),
      locations: accessControl
        .filter(ac => ac.type === 'LOCATION')
        .map(ac => ac.location_id)
    };

    return NextResponse.json(formattedAccess);
  } catch (error) {
    console.error('Error fetching course access control:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch course access control' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid course ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { departments, roles, locations }: AccessControlData = data;

    // Validate input arrays
    if (!Array.isArray(departments) || !Array.isArray(roles) || !Array.isArray(locations)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid access control data format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete existing access control entries
    await prisma.$executeRaw`DELETE FROM "CourseAccess" WHERE course_id = ${courseId}`;

    // Create new access control entries
    const createDepartments = departments.map((deptId: number) => ({
      course_id: courseId,
      department_id: deptId,
      type: 'DEPARTMENT' as const
    }));

    const createRoles = roles.map((roleId: number) => ({
      course_id: courseId,
      role_id: roleId,
      type: 'ROLE' as const
    }));

    const createLocations = locations.map((locId: number) => ({
      course_id: courseId,
      location_id: locId,
      type: 'LOCATION' as const
    }));

    await prisma.$transaction([
      ...createDepartments.map(data => 
        prisma.$executeRaw`
          INSERT INTO "CourseAccess" (course_id, department_id, type)
          VALUES (${data.course_id}, ${data.department_id}, ${data.type})
        `
      ),
      ...createRoles.map(data => 
        prisma.$executeRaw`
          INSERT INTO "CourseAccess" (course_id, role_id, type)
          VALUES (${data.course_id}, ${data.role_id}, ${data.type})
        `
      ),
      ...createLocations.map(data => 
        prisma.$executeRaw`
          INSERT INTO "CourseAccess" (course_id, location_id, type)
          VALUES (${data.course_id}, ${data.location_id}, ${data.type})
        `
      )
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating course access control:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update course access control' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper function to check if a user has access to a course
export async function hasAccess(userId: number, courseId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role_id: true,
      department_id: true,
      location_id: true
    }
  });

  if (!user) return false;

  const accessControl = await prisma.$queryRaw<CourseAccessRecord[]>`
    SELECT * FROM "CourseAccess"
    WHERE course_id = ${courseId}
  `;

  return accessControl.some(ac => {
    if (ac.type === 'DEPARTMENT' && ac.department_id === user.department_id) return true;
    if (ac.type === 'ROLE' && ac.role_id === user.role_id) return true;
    if (ac.type === 'LOCATION' && ac.location_id === user.location_id) return true;
    return false;
  });
}