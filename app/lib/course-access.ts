// /app/lib/course-access.ts
import { prisma } from '@/lib/prisma';

interface CourseAccess {
  type: 'DEPARTMENT' | 'ROLE' | 'LOCATION';
  department_id?: number | null;
  role_id?: number | null;
  location_id?: number | null;
}

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

  const accessControl = await prisma.$queryRaw<CourseAccess[]>`
    SELECT * FROM "CourseAccess"
    WHERE course_id = ${courseId}
  `;

  return accessControl.some((ac: CourseAccess) => {
    if (ac.type === 'DEPARTMENT' && ac.department_id === user.department_id) return true;
    if (ac.type === 'ROLE' && ac.role_id === user.role_id) return true;
    if (ac.type === 'LOCATION' && ac.location_id === user.location_id) return true;
    return false;
  });
}