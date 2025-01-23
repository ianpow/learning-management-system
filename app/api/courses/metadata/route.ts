// /app/api/courses/metadata/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Metadata {
  departments: Array<{ id: number; name: string; }>;
  roles: Array<{ id: number; name: string; }>;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [departments, roles] = await Promise.all([
      prisma.department.findMany({
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.role.findMany({
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ]);

    const response: Metadata = {
      departments,
      roles
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}