// /app/components/admin/user-management.tsx
'use client'

import { useState, useEffect } from 'react'
import { User, Edit, Trash, Plus, Search } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import AddUserModal from '@/components/admin/add-user-modal'

interface User {
 id: number
 email: string
 first_name: string
 last_name: string
 role: { name: string }
 department: { name: string }
 location: { name: string }
}

export default function UserManagement() {
 const [users, setUsers] = useState<User[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [searchInput, setSearchInput] = useState('')
 const [searchTerm, setSearchTerm] = useState('')
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [initialized, setInitialized] = useState(false)

 useEffect(() => {
   fetchUsers()
   setInitialized(true)
 }, [])

 const fetchUsers = async () => {
   try {
     setLoading(true)
     const response = await fetch('/api/users')
     if (!response.ok) throw new Error('Failed to fetch users')
     const data = await response.json()
     setUsers(Array.isArray(data) ? data : [])
   } catch (err) {
     setError('Failed to load users')
     console.error('Error:', err)
   } finally {
     setLoading(false)
   }
 }

 const handleSearch = (e: React.FormEvent) => {
   e.preventDefault()
   setSearchTerm(searchInput)
 }

 const handleAddUser = async (userData: any) => {
   try {
     const response = await fetch('/api/users', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(userData)
     })

     if (!response.ok) {
       throw new Error('Failed to add user')
     }

     await fetchUsers()
   } catch (err) {
     setError('Failed to add user')
     console.error('Error:', err)
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
     console.error('Error:', err)
   }
 }

 if (!initialized || loading) {
   return <div>Loading...</div>
 }

 if (error) {
   return <Alert variant="destructive">{error}</Alert>
 }

 return (
   <div className="space-y-4">
     <div className="flex justify-between items-center">
       <form onSubmit={handleSearch} className="flex gap-2">
         <div className="relative">
           <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
           <input
             type="text"
             placeholder="Search users..."
             className="pl-10 pr-4 py-2 border rounded-md"
             value={searchInput}
             onChange={(e) => {
               setSearchInput(e.target.value)
               setSearchTerm(e.target.value) // Keep instant search
             }}
           />
         </div>
         <Button type="submit" variant="default">
           <Search className="h-4 w-4" />
         </Button>
       </form>
       <Button onClick={() => setIsModalOpen(true)}>
         <Plus className="h-4 w-4 mr-2" />
         Add User
       </Button>
     </div>

     <div className="bg-white shadow rounded-lg">
       <table className="min-w-full">
         <thead>
           <tr className="border-b">
             <th className="px-6 py-3 text-left">Name</th>
             <th className="px-6 py-3 text-left">Email</th>
             <th className="px-6 py-3 text-left">Role</th>
             <th className="px-6 py-3 text-left">Department</th>
             <th className="px-6 py-3 text-left">Location</th>
             <th className="px-6 py-3 text-right">Actions</th>
           </tr>
         </thead>
         <tbody>
           {Array.isArray(users) && users.length > 0 ? users
             .filter(user => user && typeof user === 'object')
             .filter(user => 
               ((user.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (user.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (user.role?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (user.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (user.location?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
             )
             .map(user => (
               <tr key={user.id} className="border-b">
                 <td className="px-6 py-4">{user.first_name || ''} {user.last_name || ''}</td>
                 <td className="px-6 py-4">{user.email || ''}</td>
                 <td className="px-6 py-4">{user.role?.name || ''}</td>
                 <td className="px-6 py-4">{user.department?.name || ''}</td>
                 <td className="px-6 py-4">{user.location?.name || ''}</td>
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
             )) : (
               <tr>
                 <td colSpan={6} className="px-6 py-4 text-center">
                   No users found
                 </td>
               </tr>
             )}
         </tbody>
       </table>
     </div>

     <AddUserModal
       open={isModalOpen}
       onOpenChange={setIsModalOpen}
       onSubmit={handleAddUser}
     />
   </div>
 )
}