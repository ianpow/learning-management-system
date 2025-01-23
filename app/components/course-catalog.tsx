// /app/components/course-catalog.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, Users, ArrowRight, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  thumbnail_url?: string;
  enrolled_count: number;
  category_id?: string | number;  // Added this
  progress?: number;
  enrollment_date?: string;
  completion_date?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Enrollment {
  id: number;
  course_id: number;
  enrollment_date: string;
  progress?: number;
}

const CourseCatalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchUserEnrollments();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnrollments = async () => {
    try {
      const response = await fetch('/api/user/enrollments');
      const data = await response.json();
      setUserEnrollments(data);
    } catch (err) {
      setError('Failed to load enrollments');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/course-categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          enrollmentType: 'self'
        })
      });
  
      if (!response.ok) throw new Error('Failed to enroll');
  
      const newEnrollment = await response.json();
      setUserEnrollments(prev => [...prev, newEnrollment]);
      setSuccessMessage('Successfully enrolled in course');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to enroll in course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isEnrolled = (courseId: number): boolean => {
    return userEnrollments.some(enrollment => enrollment.course_id === courseId);
  };

    interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const enrolled = isEnrolled(course.id);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="aspect-video bg-gray-100 relative">
          <img 
            src={course.thumbnail_url || "/api/placeholder/400/225"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {enrolled && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
              <Check className="inline-block h-4 w-4 mr-1" />
              Enrolled
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span className="mr-4">{course.duration}</span>
            <Users className="h-4 w-4 mr-1" />
            <span>{course.enrolled_count} enrolled</span>
          </div>
          {enrolled ? (
            <button
              onClick={() => window.location.href = `/courses/${course.id}`}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Continue Learning
              <ArrowRight className="inline-block h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={() => handleEnroll(course.id)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Enroll Now
              <ArrowRight className="inline-block h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Course Catalog</h2>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <p>No courses found matching your criteria</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Your Learning Journey</h3>
        <div className="space-y-4">
          {userEnrollments.map((enrollment) => {
            const course = courses.find(c => c.id === enrollment.course_id);
            if (!course) return null;

            return (
              <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">{course.title}</h4>
                  <div className="text-sm text-gray-500">
                    Enrolled on: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = `/courses/${course.id}`}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Continue
                    <ArrowRight className="inline-block h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            );
          })}

          {userEnrollments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't enrolled in any courses yet</p>
              <p className="text-sm mt-2">Browse the catalog above to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;
