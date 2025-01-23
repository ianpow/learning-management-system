// app/certificates/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession(authOptions);
   if (!session?.user?.id) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 401 }
     );
   }

   const certificate = await prisma.certificate.findUnique({
     where: {
       id: parseInt(params.id)
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

   return NextResponse.json(certificate);
 } catch (error) {
   return NextResponse.json(
     { error: 'Failed to fetch certificate' },
     { status: 500 }
   );
 }
}