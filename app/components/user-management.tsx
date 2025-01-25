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

// In user-management.tsx
useEffect(() => {
  fetchUsers();
}, []);

const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    setUserData({
      users: data,
      departments: [],
      locations: [],
      roles: []
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

  const filteredUsers = userData?.users.filter(user => {
    const searchMatch = 
      (user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()));
  
    const filterMatch = 
      (!filters.department || user.department.id.toString() === filters.department) &&
      (!filters.location || user.location.id.toString() === filters.location) &&
      (!filters.role || user.role.id.toString() === filters.role);
  
    return searchMatch && filterMatch;
  }) || [];
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">User Management</h2>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <UserPlus className="inline-block h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Search and Filters */}
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
            {/* Filter Dropdowns */}
            {/* ... Rest of the filtering UI ... */}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... Table implementation ... */}
          </table>
        </div>
      </div>

      {/* User Modal would be imported and used here */}
    </div>
  );
};

export default UserManagement;