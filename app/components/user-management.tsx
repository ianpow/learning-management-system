// /app/components/user-management.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Edit, 
  Trash, 
  Search, 
  RefreshCw 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AddUserModal from '@/components/admin/add-user-modal';

interface Department {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  department: Department;
  location: Location;
  role: Role;
  manager_id: number | null;
}

interface UserData {
  users: User[];
  departments: Department[];
  locations: Location[];
  roles: Role[];
}

interface Filters {
  department: string;
  location: string;
  role: string;
}

const UserManagement = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    department: '',
    location: '',
    role: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes, rolesRes, locsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments'),
        fetch('/api/roles'),
        fetch('/api/locations')
      ]);

      if (!usersRes.ok || !deptsRes.ok || !rolesRes.ok || !locsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [users, departments, roles, locations] = await Promise.all([
        usersRes.json(),
        deptsRes.json(),
        rolesRes.json(),
        locsRes.json()
      ]);

      setUserData({
        users,
        departments,
        roles,
        locations
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUserData(prev => prev ? {
        ...prev,
        users: prev.users.filter(user => user.id !== userId)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
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

  if (!userData) {
    return <Alert variant="destructive">
      <AlertDescription>No user data available</AlertDescription>
    </Alert>;
  }

  const filteredUsers = userData.users.filter(user => {
    const searchMatch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
  
    const filterMatch = 
      (!filters.department || user.department.id.toString() === filters.department) &&
      (!filters.location || user.location.id.toString() === filters.location) &&
      (!filters.role || user.role.id.toString() === filters.role);
  
    return searchMatch && filterMatch;
  });
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">User Management</h2>
          <Button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              {userData.departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="border rounded px-3 py-2"
            >
              <option value="">All Roles</option>
              {userData.roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="border rounded px-3 py-2"
            >
              <option value="">All Locations</option>
              {userData.locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.department.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.location.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={async (userData) => {
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
            });
            if (!response.ok) throw new Error('Failed to add user');
            await fetchUsers();
            setIsModalOpen(false);
          } catch (err) {
            setError('Failed to add user');
          }
        }}
      />
    </div>
  );
};

export default UserManagement;