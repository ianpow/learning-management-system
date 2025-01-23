// /app/api/courses/[id]/validate/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ScormValidator } from '@/lib/scorm-validator';

interface ValidationRequest {
  scormUrl: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: {
    title?: string;
    duration?: number;
    objectives?: string[];
    prerequisites?: string[];
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = parseInt(params.id);
    const body = await request.json() as ValidationRequest;

    if (!body.scormUrl) {
      return NextResponse.json(
        { error: 'SCORM URL is required' },
        { status: 400 }
      );
    }

    const validator = new ScormValidator(body.scormUrl);
    const validationResult = await validator.validate();

    return NextResponse.json(validationResult);
  } catch (error) {
    return NextResponse.json(
      { 
        isValid: false,
        errors: [(error as Error).message]
      },
      { status: 500 }
    );
  }
}