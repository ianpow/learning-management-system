// /app/components/course-assignment.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, Check, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  department: {
    id: number;
    name: string;
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
}

interface Department {
  id: number;
  name: string;
}

interface AssignmentState {
  users: Set<number>;
  courses: Set<number>;
}

const CourseAssignment: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selection, setSelection] = useState<AssignmentState>({
    users: new Set(),
    courses: new Set()
  });
  const [filters, setFilters] = useState({
    department: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, deptsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/courses'),
        fetch('/api/departments')
      ]);

      if (!usersRes.ok || !coursesRes.ok || !deptsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, coursesData, deptsData] = await Promise.all([
        usersRes.json(),
        coursesRes.json(),
        deptsRes.json()
      ]);

      setUsers(usersData);
      setCourses(coursesData);
      setDepartments(deptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    try {
      const response = await fetch('/api/courses/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: Array.from(selection.users),
          courseIds: Array.from(selection.courses)
        })
      });

      if (!response.ok) throw new Error('Failed to assign courses');

      setSuccess('Courses assigned successfully');
      setSelection({ users: new Set(), courses: new Set() });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign courses');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesDepartment = !filters.department || 
      user.department.id.toString() === filters.department;
    const matchesSearch = !filters.search || 
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Users Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Select Users</h2>
          
          <div className="space-y-4 mb-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border rounded"
                  />
                </div>
              </div>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="border rounded px-3 py-2"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded max-h-96 overflow-y-auto">
            {filteredUsers.map(user => (
              <label
                key={user.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selection.users.has(user.id)}
                  onChange={(e) => {
                    const newUsers = new Set(selection.users);
                    if (e.target.checked) {
                      newUsers.add(user.id);
                    } else {
                      newUsers.delete(user.id);
                    }
                    setSelection(prev => ({ ...prev, users: newUsers }));
                  }}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Courses Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Select Courses</h2>
          
          <div className="border rounded max-h-96 overflow-y-auto">
            {courses.map(course => (
              <label
                key={course.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selection.courses.has(course.id)}
                  onChange={(e) => {
                    const newCourses = new Set(selection.courses);
                    if (e.target.checked) {
                      newCourses.add(course.id);
                    } else {
                      newCourses.delete(course.id);
                    }
                    setSelection(prev => ({ ...prev, courses: newCourses }));
                  }}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-gray-500">{course.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAssign}
          disabled={!selection.users.size || !selection.courses.size}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Assign Courses
        </button>
      </div>
    </div>
  );
};

export default CourseAssignment;