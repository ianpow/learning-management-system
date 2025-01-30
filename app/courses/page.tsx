// app/courses/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface Course {
  id: number
  title: string
  description: string
  duration_minutes: number
  enrolled_count: number
  is_enrolled: boolean
  progress?: number
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course_id: courseId })
      })
      if (!response.ok) throw new Error('Failed to enroll')
      await fetchCourses()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{course.description}</p>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>{course.duration_minutes} minutes</span>
              <span>{course.enrolled_count} enrolled</span>
            </div>
            {course.is_enrolled ? (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = `/courses/${course.id}/player`}
                >
                  {course.progress ? 'Continue Course' : 'Launch Course'}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleEnroll(course.id)}
              >
                Enroll Now
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}