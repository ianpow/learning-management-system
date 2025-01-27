// /app/api/users/bulk-import/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

interface BulkUserData {
 email: string;
 first_name: string;
 last_name: string;
 department_id: string;
 role_id: string;
 location_id: string;
 password: string;
 manager_email?: string;
}

const validateUserData = async (userData: BulkUserData) => {
 if (!userData.email || !userData.email.includes('@')) {
   return { isValid: false, error: 'Invalid email' };
 }
 if (!userData.first_name || !userData.last_name) {
   return { isValid: false, error: 'Missing name fields' };
 }
 if (!userData.password || userData.password.length < 8) {
   return { isValid: false, error: 'Password must be at least 8 characters' };
 }
 if (!userData.department_id || !userData.role_id || !userData.location_id) {
   return { isValid: false, error: 'Missing required IDs' };
 }

 let managerId = null;
 if (userData.manager_email) {
   const manager = await prisma.user.findUnique({
     where: { email: userData.manager_email }
   });
   if (!manager) {
     return { isValid: false, error: 'Manager email not found in system' };
   }
   managerId = manager.id;
 }

 return { isValid: true, managerId };
};

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

   if (!Array.isArray(users) || users.length === 0) {
     return NextResponse.json(
       { error: 'No users provided' },
       { status: 400 }
     );
   }

   const results = await Promise.all(
     users.map(async (userData: BulkUserData) => {
       try {
         // Validate user data
         const validation = await validateUserData(userData);
         if (!validation.isValid) {
           return { 
             success: false, 
             email: userData.email, 
             error: validation.error 
           };
         }

         // Hash the provided password
         const hashedPassword = await bcrypt.hash(userData.password, 10);

         // Create user with manager if specified
         const user = await prisma.user.create({
           data: {
             email: userData.email,
             password_hash: hashedPassword,
             first_name: userData.first_name,
             last_name: userData.last_name,
             department_id: parseInt(userData.department_id),
             role_id: parseInt(userData.role_id),
             location_id: parseInt(userData.location_id),
             manager_id: validation.managerId
           }
         });

         return { 
           success: true, 
           email: userData.email,
           message: 'User created successfully'
         };
       } catch (error) {
         console.error('Error creating user:', error);
         return { 
           success: false, 
           email: userData.email, 
           error: error instanceof Error ? error.message : 'Failed to create user' 
         };
       }
     })
   );

   const successful = results.filter(r => r.success).length;
   const failed = results.filter(r => !r.success).length;

   return NextResponse.json({
     success: failed === 0,
     summary: {
       total: users.length,
       successful,
       failed
     },
     results: results
   });

 } catch (error) {
   console.error('Bulk import error:', error);
   return NextResponse.json(
     { error: 'Failed to process bulk import' },
     { status: 500 }
   );
 }
}