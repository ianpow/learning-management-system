// /app/api/certificates/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const certificate = await prisma.certificate.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: true,
        course: true
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Check if the user is authorized to view this certificate
    if (certificate.user_id !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}