// /app/components/team-progress-dashboard.tsx
'use client'

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, Award, Clock, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  lastActive: string;
}

interface TeamProgress {
  totalMembers: number;
  totalAssignedCourses: number;
  averageCompletion: number;
  memberProgress: TeamMember[];
  monthlyProgress: Array<{
    month: string;
    completions: number;
    enrollments: number;
  }>;
}

const TeamProgressDashboard: React.FC = () => {
  const [teamData, setTeamData] = useState<TeamProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTeamProgress();
  }, [dateRange]);

  const fetchTeamProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/team-progress?start=${dateRange.start}&end=${dateRange.end}`
      );
      if (!response.ok) throw new Error('Failed to fetch team progress');
      const data = await response.json();
      setTeamData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team progress');
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

  if (!teamData) {
    return <Alert variant="destructive">
      <AlertDescription>No team data available</AlertDescription>
    </Alert>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Team Progress Dashboard</h2>
          <div className="flex space-x-4">
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
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Team Members</p>
                <h3 className="text-2xl font-bold">{teamData.totalMembers}</h3>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Assigned Courses</p>
                <h3 className="text-2xl font-bold">{teamData.totalAssignedCourses}</h3>
              </div>
              <Award className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Average Completion</p>
                <h3 className="text-2xl font-bold">{teamData.averageCompletion}%</h3>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Progress Chart */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teamData.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke="#10B981"
                    name="Completions"
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#4F46E5"
                    name="Enrollments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Members Progress */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Team Members Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData.memberProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="first_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="averageProgress"
                    fill="#4F46E5"
                    name="Progress (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamData.memberProgress.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.completedCourses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.inProgressCourses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${member.averageProgress}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {member.averageProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProgressDashboard;