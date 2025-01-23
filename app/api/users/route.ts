// /app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Department {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  department: Department;
  location: Location;
  role: Role;
  manager_id: number | null;
}

interface UserResponse {
  users: User[];
  departments: Department[];
  locations: Location[];
  roles: Role[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [users, departments, locations, roles] = await Promise.all([
      prisma.user.findMany({
        include: {
          department: true,
          location: true,
          role: true
        }
      }),
      prisma.department.findMany(),
      prisma.location.findMany(),
      prisma.role.findMany()
    ]) as [User[], Department[], Location[], Role[]];

    const response: UserResponse = {
      users,
      departments,
      locations,
      roles
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}