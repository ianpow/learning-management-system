// /app/components/learning-path-list.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  ArrowRight,
  CheckCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LearningPath {
  id: number;
  name: string;
  description: string;
  total_courses: number;
  enrolled_count: number;
  estimated_hours: number;
  completion_percentage?: number;
}

const LearningPathList = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const response = await fetch('/api/learning-paths');
        if (!response.ok) throw new Error('Failed to fetch learning paths');
        const data = await response.json();
        setPaths(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load learning paths');
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }

  if (error) {
    return <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">Learning Paths</h2>
        
        <div className="grid gap-6">
          {paths.map((path) => (
            <div key={path.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{path.name}</h3>
                  <p className="text-gray-600 mb-4">{path.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {path.total_courses} Courses
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {path.estimated_hours} Hours
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {path.enrolled_count} Enrolled
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = `/learning-paths/${path.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {path.completion_percentage !== undefined ? (
                    <>
                      Continue
                      <ArrowRight className="inline-block h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Start Path
                      <ArrowRight className="inline-block h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>

              {path.completion_percentage !== undefined && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{path.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${path.completion_percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPathList;