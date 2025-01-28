// app/components/admin/AdminDashboard.tsx
'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import UserManagement from '@/components/admin/user-management'
import BulkUserUpload from '@/components/bulk-user-manager'
import CourseUpload from '@/components/admin/course-upload'
import Reports from '@/components/admin/reports'

export default function AdminDashboard() {
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