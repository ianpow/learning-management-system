'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import UserManagement from '@/components/admin/user-management'
import BulkUserUpload from '@/components/bulk-user-manager'
import CourseUpload from '@/components/admin/course-upload'
import Reports from '@/components/admin/reports'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)

    if (status === 'loading') return

    try {
      if (!session) {
        console.log('No session, redirecting')
        redirect('/')
        return
      }

      if (session.user.role !== 'admin') {
        console.log('Not admin, redirecting')
        redirect('/')
        return
      }

      console.log('Admin verified, loading complete')
      setLoading(false)
    } catch (err) {
      console.error('Error in admin page:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [session, status])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
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

        {/* Wrap each tab content in error boundary */}
        <div className="relative">
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </div>

        <div className="relative">
          <TabsContent value="bulk">
            <BulkUserUpload />
          </TabsContent>
        </div>

        <div className="relative">
          <TabsContent value="courses">
            <CourseUpload />
          </TabsContent>
        </div>

        <div className="relative">
          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}