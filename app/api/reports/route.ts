// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCSVReport, generatePDFReport, groupByMonth } from '@/lib/report-helpers';

interface Course {
  title: string;
  enrollments: Array<{
    completion_date: Date | null;
  }>;
}

interface Enrollment {
  enrollment_date: Date;
  completion_date: Date | null;
}

async function fetchReportData(startDate: string | null, endDate: string | null) {
  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      include: { enrollments: true }
    }) as Promise<Course[]>,
    prisma.courseEnrollment.findMany({
      where: {
        enrollment_date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      }
    }) as Promise<Enrollment[]>
  ]);

  return {
    completionRates: courses.map((course: Course) => ({
      course: course.title,
      rate: course.enrollments.length ? 
        (course.enrollments.filter((e: { completion_date: Date | null }) => e.completion_date).length / course.enrollments.length) * 100 : 0
    })),
    monthlyEnrollments: groupByMonth(enrollments)
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  const data = await fetchReportData(startDate, endDate);

  if (format === 'csv') {
    const csv = formatCSVReport(data);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=report.csv'
      }
    });
  }

  if (format === 'pdf') {
    const pdf = await generatePDFReport(data);
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=report.pdf'
      }
    });
  }

  return NextResponse.json(data);
}