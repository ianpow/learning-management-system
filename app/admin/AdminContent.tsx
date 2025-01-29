// app/admin/AdminContent.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'

// Dynamically import components with loading fallbacks
const UserManagement = dynamic(
  () => import('@/components/admin/user-management'),
  { loading: () => <div>Loading...</div> }
)

const BulkUserUpload = dynamic(
  () => import('@/components/bulk-user-manager'),
  { loading: () => <div>Loading...</div> }
)

const CourseUpload = dynamic(
  () => import('@/components/admin/course-upload'),
  { loading: () => <div>Loading...</div> }
)

const Reports = dynamic(
  () => import('@/components/admin/reports'),
  { loading: () => <div>Loading...</div> }
)

export default function AdminContent() {
  const { data: session } = useSession({ required: true })
  const [activeTab, setActiveTab] = useState('users')

  if (!session?.user?.role || session.user.role !== 'admin') {
    return <div className="p-6">Access denied</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {activeTab === 'users' && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
        {activeTab === 'bulk' && (
          <TabsContent value="bulk">
            <BulkUserUpload />
          </TabsContent>
        )}
        {activeTab === 'courses' && (
          <TabsContent value="courses">
            <CourseUpload />
          </TabsContent>
        )}
        {activeTab === 'reports' && (
          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}