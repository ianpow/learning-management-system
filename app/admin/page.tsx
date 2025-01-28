// /app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import UserManagement from '@/components/admin/user-management'
import BulkUserUpload from '@/components/bulk-user-manager'
import CourseUpload from '@/components/admin/course-upload'
import Reports from '@/components/admin/reports'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminPage() {
 const { data: session, status } = useSession()
 const router = useRouter()
 const [initialized, setInitialized] = useState(false)

 useEffect(() => {
   if (status === 'unauthenticated') {
     router.push('/login')
     return
   }

   if (status === 'authenticated') {
     if (session?.user?.role !== 'admin') {
       router.push('/')
       return
     }
     setInitialized(true)
   }
 }, [status, session, router])

 if (!initialized || status === 'loading') {
   return (
     <div className="flex justify-center items-center min-h-screen">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
     </div>
   )
 }

 if (!session?.user?.role || session.user.role !== 'admin') {
   return (
     <Alert variant="destructive">
       <AlertDescription>You do not have permission to access this page.</AlertDescription>
     </Alert>
   )
 }

 return (
   <div className="p-6">
     <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
     <Tabs defaultValue="users" className="space-y-4">
       <TabsList>
         <TabsTrigger value="users">Users</TabsTrigger>
         <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
         <TabsTrigger value="courses">Courses</TabsTrigger>
         <TabsTrigger value="reports">Reports</TabsTrigger>
       </TabsList>

       <TabsContent value="users">
         <UserManagement />
       </TabsContent>
       <TabsContent value="bulk">
         <BulkUserUpload />
       </TabsContent>
       <TabsContent value="courses">
         <CourseUpload />
       </TabsContent>
       <TabsContent value="reports">
         <Reports />
       </TabsContent>
     </Tabs>
   </div>
 )
}