// /app/api/users/template/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const template = [
    'email,first_name,last_name,department,role,location,manager_email',
    'john.doe@example.com,John,Doe,Sales,Staff,London,manager@example.com'
  ].join('\n');

  return new NextResponse(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=user-import-template.csv'
    }
  });
}