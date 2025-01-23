// /app/components/reporting-dashboard.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  Calendar,
  Building2,
  Users,
  Filter
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReportData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    completions: number;
  };
  coursePopularity: Array<{
    course: string;
    enrollments: number;
  }>;
}

const ReportingDashboard = () => {
  const [reportType, setReportType] = useState('completion_rates');
  const [locationId, setLocationId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, locationId, departmentId, dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        reportType,
        ...(locationId && { locationId }),
        ...(departmentId && { departmentId }),
        ...(dateRange.start_date && { start_date: dateRange.start_date }),
        ...(dateRange.end_date && { end_date: dateRange.end_date })
      });

      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      
      const data = await response.json();
      setReportData(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Reports Dashboard</h2>
          <div className="flex space-x-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="completion_rates">Completion Rates</option>
              <option value="course_popularity">Course Popularity</option>
              <option value="user_activity">User Activity</option>
            </select>

            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        {reportData && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-2xl font-bold">{reportData.overview.totalUsers}</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-gray-600">Total Courses</div>
                <div className="text-2xl font-bold">{reportData.overview.totalCourses}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-sm text-gray-600">Completions</div>
                <div className="text-2xl font-bold">{reportData.overview.completions}</div>
              </div>
            </div>

            {/* Course Popularity Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Course Popularity</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.coursePopularity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrollments" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingDashboard;