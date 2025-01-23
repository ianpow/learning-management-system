// /app/api/users/bulk-import/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { users } = await request.json();

    // Add validation here
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'No users provided' },
        { status: 400 }
      );
    }

    // Process users
    const results = await Promise.all(
      users.map(async (userData) => {
        try {
          const tempPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(tempPassword, 10);

          const user = await prisma.user.create({
            data: {
              email: userData.email,
              password_hash: hashedPassword,
              first_name: userData.first_name,
              last_name: userData.last_name,
              department_id: userData.department_id,
              role_id: userData.role_id,
              location_id: userData.location_id,
              manager_id: userData.manager_id || null
            }
          });

          // You would typically send an email with the temporary password here
          return { success: true, email: userData.email };
        } catch (error) {
          return { success: false, email: userData.email, error: 'Failed to create user' };
        }
      })
    );

    return NextResponse.json({
      success: true,
      results: results
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    );
  }
}