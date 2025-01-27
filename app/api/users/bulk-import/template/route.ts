// /app/api/users/template/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const template = [
    'email,first_name,last_name,department_id,role_id,location_id,password',
    'example@email.com,John,Doe,1,1,1,Password123,manager@example.com'
  ].join('\n');

  // ID here must match those in app/components/bulk-user-management.tsx and user-management.tsx
  const templateWithComments = [
    '# Instructions:',
    '# department_id: 1=HR, 2=IT, 3=Sales',
    '# role_id: 1=Admin, 2=Manager, 3=User',
    '# location_id: 1=London, 2=New York, 3=Singapore',
    '# manager_email: Email of the user\'s manager (must exist in system)',
    '',
    template
  ].join('\n');

  return new NextResponse(templateWithComments, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=user-import-template.csv'
    }
  });
}