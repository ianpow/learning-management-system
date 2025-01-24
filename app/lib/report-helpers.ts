// app/lib/report-helpers.ts
import jsPDF from 'jspdf';
import { Parser } from 'json2csv';

interface ReportData {
  completionRates: Array<{
    course: string;
    rate: number;
  }>;
  monthlyEnrollments: Array<{
    month: string;
    enrollments: number;
    completions: number;
  }>;
}

export function groupByMonth(enrollments: any[]) {
  const monthly = enrollments.reduce((acc, enrollment) => {
    const month = enrollment.enrollment_date.toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = { enrollments: 0, completions: 0 };
    }
    acc[month].enrollments++;
    if (enrollment.completion_date) {
      acc[month].completions++;
    }
    return acc;
  }, {});

  return Object.entries(monthly).map(([month, data]) => ({
    month,
    ...data as { enrollments: number; completions: number }
  }));
}

export function formatCSVReport(data: ReportData): string {
  const completionParser = new Parser({
    fields: ['course', 'rate']
  });
  const enrollmentParser = new Parser({
    fields: ['month', 'enrollments', 'completions']
  });

  const completionCSV = completionParser.parse(data.completionRates);
  const enrollmentCSV = enrollmentParser.parse(data.monthlyEnrollments);

  return `Completion Rates\n${completionCSV}\n\nMonthly Enrollments\n${enrollmentCSV}`;
}

export async function generatePDFReport(data: ReportData): Promise<ArrayBuffer> {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Learning Management System Report', 20, 20);
  
  doc.setFontSize(14);
  doc.text('Course Completion Rates', 20, 40);
  
  let y = 50;
  data.completionRates.forEach(item => {
    doc.setFontSize(12);
    doc.text(`${item.course}: ${item.rate.toFixed(1)}%`, 20, y);
    y += 10;
  });
  
  doc.setFontSize(14);
  doc.text('Monthly Activity', 20, y + 20);
  
  data.monthlyEnrollments.forEach(item => {
    doc.setFontSize(12);
    doc.text(
      `${item.month}: ${item.enrollments} enrollments, ${item.completions} completions`,
      20, y + 30
    );
    y += 10;
  });
  
  return doc.output('arraybuffer');
}