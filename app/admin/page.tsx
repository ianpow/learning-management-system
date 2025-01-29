// /app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import UserManagement from '@/components/admin/user-management'
import BulkUserUpload from '@/components/bulk-user-manager'
import CourseUpload from '@/components/admin/course-upload'
import Reports from '@/components/admin/reports'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || status === 'loading') {
    return <div className="p-6">Loading...</div>
  }

  if (!session?.user?.role || session.user.role !== 'admin') {
    return <div className="p-6">Access denied</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mt-6">
        <Tabs defaultValue="users">
          <div className="mb-6 border-b">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-6">
            <TabsContent value="users">
              {mounted && <UserManagement />}
            </TabsContent>
            <TabsContent value="bulk">
              {mounted && <BulkUserUpload />}
            </TabsContent>
            <TabsContent value="courses">
              {mounted && <CourseUpload />}
            </TabsContent>
            <TabsContent value="reports">
              {mounted && <Reports />}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}