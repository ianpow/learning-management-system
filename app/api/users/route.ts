// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  location: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [users, departments, locations, roles] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } }
      }
    }),
    prisma.department.findMany(),
    prisma.location.findMany(),
    prisma.role.findMany()
  ]);

  return NextResponse.json({ users, departments, locations, roles });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestData: CreateUserRequest = await request.json();
  const hashedPassword = await bcrypt.hash(requestData.password, 10);

  const user = await prisma.user.create({
    data: {
      email: requestData.email,
      password_hash: hashedPassword,
      first_name: requestData.firstName,
      last_name: requestData.lastName,
      role_id: parseInt(requestData.role),
      department_id: parseInt(requestData.department),
      location_id: parseInt(requestData.location)
    }
  });

  return NextResponse.json(user);
}