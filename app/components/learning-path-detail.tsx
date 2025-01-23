// /app/components/learning-path-detail.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Lock,
  ArrowRight 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LearningPathDetailProps {
  pathId: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  completion_status: 'not_started' | 'in_progress' | 'completed';
  is_locked: boolean;
}

interface LearningPath {
  id: number;
  name: string;
  description: string;
  courses: Course[];
  progress: number;
}

const LearningPathDetail = ({ pathId }: LearningPathDetailProps) => {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPathDetails = async () => {
      try {
        const response = await fetch(`/api/learning-paths/${pathId}`);
        if (!response.ok) throw new Error('Failed to load learning path');
        const data = await response.json();
        setPath(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load learning path');
      } finally {
        setLoading(false);
      }
    };

    fetchPathDetails();
  }, [pathId]);

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

  if (!path) {
    return <Alert variant="destructive">
      <AlertDescription>Learning path not found</AlertDescription>
    </Alert>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">{path.name}</h1>
        <p className="text-gray-600 mb-4">{path.description}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {path.courses.length} Courses
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {Math.round(path.courses.reduce((total, course) => 
              total + course.duration_minutes, 0) / 60)} Hours
          </span>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{path.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${path.progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {path.courses.map((course, index) => (
            <div 
              key={course.id}
              className={`p-4 border rounded-lg ${
                course.is_locked ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
                      {index + 1}
                    </span>
                    <h3 className="font-medium">{course.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration_minutes} minutes
                  </div>
                </div>

                <div className="ml-4">
                  {course.is_locked ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : course.completion_status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <button
                      onClick={() => window.location.href = `/courses/${course.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {course.completion_status === 'in_progress' ? 'Continue' : 'Start'}
                      <ArrowRight className="inline-block h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail;