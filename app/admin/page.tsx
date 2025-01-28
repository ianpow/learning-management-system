//app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import UserManagement from '@/components/admin/user-management'
import BulkUserUpload from '@/components/bulk-user-manager'
import CourseUpload from '@/components/admin/course-upload'
import Reports from '@/components/admin/reports'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      // Make sure we have the role property before checking it
      if (!session?.user?.role || session.user.role !== 'admin') {
        router.push('/')
        return
      }
      setLoading(false)
    }
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>
  }

  // Add an additional check here to prevent rendering before we're sure about admin status
  if (!session?.user?.role || session.user.role !== 'admin') {
    return null
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
          {!loading && <UserManagement />}
        </TabsContent>
        <TabsContent value="bulk">
          {!loading && <BulkUserUpload />}
        </TabsContent>
        <TabsContent value="courses">
          {!loading && <CourseUpload />}
        </TabsContent>
        <TabsContent value="reports">
          {!loading && <Reports />}
        </TabsContent>
      </Tabs>
    </div>
  )
}