// /app/components/user-modal.tsx
'use client'

import React, { useState, useEffect } from 'react';
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
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  department_id: string;
  location_id: string;
  role_id: string;
  manager_id: string | null;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: User) => void;
  user?: User | null;
  departments: Department[];
  locations: Location[];
  roles: Role[];
  managers: User[];
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  departments,
  locations,
  roles,
  managers
}) => {
  const [formData, setFormData] = useState<User>({
    email: '',
    first_name: '',
    last_name: '',
    department_id: '',
    location_id: '',
    role_id: '',
    manager_id: null
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        department_id: user.department_id.toString(),
        location_id: user.location_id.toString(),
        role_id: user.role_id.toString(),
        manager_id: user.manager_id?.toString() || null
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">
          {user ? 'Edit User' : 'Create New User'}
        </h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <select
                value={formData.manager_id || ''}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value || null })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {`${manager.first_name} ${manager.last_name}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;