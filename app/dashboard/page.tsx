// /app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Course {
  id: number
  title: string
  description: string
  progress: number
  enrollment_date: string
}

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/enrollments')
      if (!response.ok) throw new Error('Failed to fetch enrollments')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
          <Button 
            onClick={() => window.location.href = '/courses'}
            className="mt-4"
          >
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Progress: {course.progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => window.location.href = `/courses/${course.id}/player`}
              >
                Continue Course
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}