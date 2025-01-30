// app/learning-paths/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface LearningPath {
  id: number
  name: string
  description: string
  total_courses: number
  progress: number
}

export default function LearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLearningPaths()
  }, [])

  const fetchLearningPaths = async () => {
    try {
      const response = await fetch('/api/learning-paths')
      if (!response.ok) throw new Error('Failed to fetch learning paths')
      const data = await response.json()
      setPaths(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Learning Paths</h1>
      
      {paths.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No learning paths available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map(path => (
            <div key={path.id} className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="font-semibold mb-2">{path.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{path.description}</p>
              <div className="text-sm text-gray-500 mb-2">
                {path.total_courses} Courses
              </div>
              {path.progress > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Progress: {path.progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button 
                className="w-full"
                onClick={() => window.location.href = `/learning-paths/${path.id}`}
              >
                {path.progress > 0 ? 'Continue Path' : 'Start Path'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}