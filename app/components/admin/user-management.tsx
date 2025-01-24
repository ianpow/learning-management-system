// app/components/admin/user-management.tsx
'use client'

import { useState, useEffect } from 'react'
import { User, Edit, Trash, Plus, Search } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import AddUserModal from '@/components/admin/add-user-modal';

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: { name: string }
  department: { name: string }
}

export default function UserManagement() {
 const [users, setUsers] = useState<User[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [searchTerm, setSearchTerm] = useState('')
 const [isModalOpen, setIsModalOpen] = useState(false);

 useEffect(() => {
   fetchUsers()
 }, [])

 const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users')
    if (!response.ok) throw new Error('Failed to fetch users')
    const data = await response.json()
    // Transform the data to match interface
    const transformedUsers = data.map((user: any) => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role?.name || '',
      department: user.department?.name || ''
    }))
    setUsers(transformedUsers)
  } catch (err) {
    setError('Failed to load users')
  } finally {
    setLoading(false)
  }
}

 const handleDeleteUser = async (userId: number) => {
   if (!confirm('Are you sure you want to delete this user?')) return
   try {
     const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
     if (!response.ok) throw new Error('Failed to delete user')
     setUsers(users.filter(user => user.id !== userId))
   } catch (err) {
     setError('Failed to delete user')
   }
 }

 if (loading) return <div>Loading...</div>
 if (error) return <Alert variant="destructive">{error}</Alert>

 return (
   <div className="space-y-4">
     <div className="flex justify-between items-center">
       <div className="relative">
         <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
         <input
           type="text"
           placeholder="Search users..."
           className="pl-10 pr-4 py-2 border rounded-md"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
         
       </div>
       <Button onClick={() => setIsModalOpen(true)}>
         <Plus className="h-4 w-4 mr-2" />
         Add User
       </Button>
       <AddUserModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
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

     <div className="bg-white shadow rounded-lg">
       <table className="min-w-full">
         <thead>
           <tr className="border-b">
             <th className="px-6 py-3 text-left">Name</th>
             <th className="px-6 py-3 text-left">Email</th>
             <th className="px-6 py-3 text-left">Role</th>
             <th className="px-6 py-3 text-left">Department</th>
             <th className="px-6 py-3 text-right">Actions</th>
           </tr>
         </thead>
         <tbody>
         {users
  .filter(user => 
    (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )
  .map(user => (
               <tr key={user.id} className="border-b">
                 <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                 <td className="px-6 py-4">{user.email}</td>
                 <td className="px-6 py-4">{user.role.name}</td>
                 <td className="px-6 py-4">{user.department.name}</td>
                 <td className="px-6 py-4 text-right">
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
 )
}