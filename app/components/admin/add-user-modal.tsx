'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
 location: string
 password: string
}

interface Role {
 id: number
 name: string
}

interface Department {
 id: number
 name: string
}

interface Location {
 id: number
 name: string
}

export default function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
 const [userData, setUserData] = useState<UserData>({
   email: '',
   firstName: '',
   lastName: '',
   role: '',
   department: '',
   location: '',
   password: ''
 })

 const [roles, setRoles] = useState<Role[]>([])
 const [departments, setDepartments] = useState<Department[]>([])
 const [locations, setLocations] = useState<Location[]>([])
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
   const fetchData = async () => {
     try {
       const [rolesRes, deptsRes, locsRes] = await Promise.all([
         fetch('/api/roles'),
         fetch('/api/departments'),
         fetch('/api/locations')
       ])

       if (!rolesRes.ok || !deptsRes.ok || !locsRes.ok) {
         throw new Error('Failed to fetch data')
       }

       const [rolesData, deptsData, locsData] = await Promise.all([
         rolesRes.json(),
         deptsRes.json(),
         locsRes.json()
       ])

       setRoles(rolesData)
       setDepartments(deptsData)
       setLocations(locsData)
     } catch (err) {
       setError('Failed to load form data')
     }
   }

   if (isOpen) {
     fetchData()
   }
 }, [isOpen])

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault()
   onSubmit(userData)
   onClose()
 }

 return (
   <Dialog open={isOpen} onOpenChange={onClose}>
     <div className="p-6 w-[500px]">
       <h2 className="text-lg font-semibold mb-4">Add New User</h2>
       
       {error && (
         <Alert variant="destructive">
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}

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
               {roles.map(role => (
                 <option key={role.id} value={role.id}>
                   {role.name}
                 </option>
               ))}
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
               {departments.map(dept => (
                 <option key={dept.id} value={dept.id}>
                   {dept.name}
                 </option>
               ))}
             </select>
           </div>
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Location</label>
           <select
             required
             className="w-full p-2 border rounded"
             value={userData.location}
             onChange={e => setUserData({...userData, location: e.target.value})}
           >
             <option value="">Select Location</option>
             {locations.map(loc => (
               <option key={loc.id} value={loc.id}>
                 {loc.name}
               </option>
             ))}
           </select>
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