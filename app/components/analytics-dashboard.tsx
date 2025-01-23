// /app/components/analytics-dashboard.tsx
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
  Users,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  Building2,
  LucideIcon
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    completedCourses: number;
    averageProgress: number;
    certificatesIssued: number;
  };
  enrollmentTrend: Array<{
    date: string;
    enrollments: number;
    completions: number;
  }>;
  departmentProgress: Array<{
    department: string;
    completionRate: number;
  }>;
  coursePopularity: Array<{
    course: string;
    enrollments: number;
  }>;
  timeToComplete: Array<{
    course: string;
    days: number;
  }>;
}

interface DateRange {
  start: string;
  end: string;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
}

interface ChartEntry {
  name: string;
  value: number;
}

const StatCard = ({ icon: Icon, title, value, trend, description }: StatCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow">
    {/* StatCard content */}
  </div>
);

const AnalyticsDashboard = () => {
  // Add dateRange state
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [data, setData] = useState<AnalyticsData>({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      completedCourses: 0,
      averageProgress: 0,
      certificatesIssued: 0
    },
    enrollmentTrend: [],
    departmentProgress: [],
    coursePopularity: [],
    timeToComplete: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?start=${dateRange.start}&end=${dateRange.end}`);
        if (!response.ok) throw new Error('Failed to fetch analytics data');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?start=${dateRange.start}&end=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };


  
  const StatCard = ({ icon: Icon, title, value, trend, description }: StatCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* StatCard content */}
    </div>
  );

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

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end space-x-4 mb-6">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          className="border rounded px-3 py-2"
        />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={data.overview.totalUsers}
          trend={5}
          description="Active learners in the platform"
        />
        <StatCard
          icon={Award}
          title="Completed Courses"
          value={data.overview.completedCourses}
          trend={12}
          description="Total course completions"
        />
        <StatCard
          icon={TrendingUp}
          title="Average Progress"
          value={`${data.overview.averageProgress}%`}
          trend={3}
          description="Across all enrolled courses"
        />
      </div>

      {/* Enrollment Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Enrollment Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="#4F46E5"
                name="New Enrollments"
              />
              <Line
                type="monotone"
                dataKey="completions"
                stroke="#10B981"
                name="Completions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rates by Department */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Department Progress</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completionRate"
                  fill="#4F46E5"
                  name="Completion Rate (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Most Popular Courses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.coursePopularity}
                  nameKey="course"
                  dataKey="enrollments"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
{data.coursePopularity.map((entry: { course: string; enrollments: number }, index: number) => (
  <Cell 
    key={`cell-${index}`}
    fill={[
      '#4F46E5',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6'
    ][index % 5]}
  />
))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time to Complete */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Average Time to Complete</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeToComplete}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="days"
                  fill="#4F46E5"
                  name="Average Days to Complete"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#4F46E5"
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="averageProgress"
                  stroke="#10B981"
                  name="Avg. Progress (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
