// /app/components/course-detail.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Play, 
  Download,
  Award,
  ArrowLeft
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CourseDetailProps {
  courseId: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  objectives?: string[];
  thumbnail_url?: string;
}

interface Enrollment {
  completion_date: string | null;
  progress: number;
}

const CourseDetail = ({ courseId }: CourseDetailProps) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const [courseRes, enrollmentRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/enrollments/user/course/${courseId}`)
      ]);

      if (!courseRes.ok) throw new Error('Failed to load course');
      if (!enrollmentRes.ok) throw new Error('Failed to load enrollment');

      const [courseData, enrollmentData] = await Promise.all([
        courseRes.json(),
        enrollmentRes.json()
      ]);

      setCourse(courseData);
      setEnrollment(enrollmentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const launchCourse = () => {
    window.location.href = `/course-player/${courseId}`;
  };

  const downloadCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/course/${courseId}`);
      if (!response.ok) throw new Error('Failed to download certificate');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download certificate');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!course || !enrollment) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Course or enrollment not found</AlertDescription>
      </Alert>
    );
  }

  const isCompleted = enrollment.completion_date !== null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative">
          <img 
            src="/api/placeholder/800/400"
            alt={course.title}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span className="mr-4">{course.duration}</span>
                {enrollment.completion_date && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>
                      Completed on {new Date(enrollment.completion_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-x-2">
              {isCompleted ? (
                <button
                  onClick={downloadCertificate}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Award className="inline-block h-4 w-4 mr-1" />
                  Download Certificate
                </button>
              ) : (
                <button
                  onClick={launchCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Play className="inline-block h-4 w-4 mr-1" />
                  Continue Learning
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Course Description</h2>
            <p className="text-gray-600">{course.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Your Progress</h2>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${enrollment.progress || 0}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {Math.round(enrollment.progress || 0)}% Complete
            </div>
          </div>

          {course.objectives && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Learning Objectives</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {course.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="flex items-center text-green-700">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Course Completed!</span>
              </div>
              <p className="mt-1 text-green-600">
                Congratulations on completing this course. You can download your certificate
                or revisit the course material at any time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
