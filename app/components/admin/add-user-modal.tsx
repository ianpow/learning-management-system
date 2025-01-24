// app/components/admin/add-user-modal.tsx
'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: UserData) => void
}

interface UserData {
  email: string
  firstName: string
  lastName: string
  role: string
  department: string
  password: string
}

export default function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [userData, setUserData] = useState<UserData>({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(userData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border rounded"
              value={userData.email}
              onChange={e => setUserData({...userData, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={userData.firstName}
                onChange={e => setUserData({...userData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={userData.lastName}
                onChange={e => setUserData({...userData, lastName: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={userData.role}
                onChange={e => setUserData({...userData, role: e.target.value})}
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={userData.department}
                onChange={e => setUserData({...userData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-2 border rounded"
              value={userData.password}
              onChange={e => setUserData({...userData, password: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add User</Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}