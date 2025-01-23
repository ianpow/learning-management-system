// app/admin/page.tsx
'use client'

import { useState } from 'react'
import UserManagement from '@/components/user-management'
import CourseUploader from '@/components/course-uploader'
import ReportingDashboard from '@/components/reporting-dashboard'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="p-6">
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 ${activeTab === 'users' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-1 ${activeTab === 'courses' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 ${activeTab === 'reports' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Reports
          </button>
        </nav>
      </div>

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'courses' && <CourseUploader />}
      {activeTab === 'reports' && <ReportingDashboard />}
    </div>
  )
}