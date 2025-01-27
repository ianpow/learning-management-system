'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AddUserModalProps {
  open: boolean  // changed from isOpen
  onOpenChange: (open: boolean) => void  // changed from onClose
  onSubmit: (userData: UserData) => void
}

interface UserData {
  email: string
  first_name: string
  last_name: string
  role_id: string
  department_id: string
  location_id: string
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

export default function AddUserModal({ open, onOpenChange, onSubmit }: AddUserModalProps) {

const [userData, setUserData] = useState<UserData>({
  email: '',
  first_name: '',     // update these to match
  last_name: '',      // the new interface
  role_id: '',
  department_id: '',
  location_id: '',
  password: ''
});

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

   if (open) {
     fetchData()
   }
 }, [open])

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault()
   onSubmit(userData)
   close()
 }

 return (
  <Dialog 
    open={open} 
    onOpenChange={onOpenChange}
  >
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
               value={userData.first_name}
               onChange={e => setUserData({...userData, first_name: e.target.value})}  // instead of firstName

             />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1">Last Name</label>
             <input
               type="text"
               required
               className="w-full p-2 border rounded"
               value={userData.last_name}
               onChange={e => setUserData({...userData, last_name: e.target.value})}   // instead of lastName
             />
           </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1">Role</label>
             <select
               required
               className="w-full p-2 border rounded"
               value={userData.role_id}
               onChange={e => setUserData({...userData, role_id: e.target.value})}     // instead of role
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
               value={userData.department_id}
               onChange={e => setUserData({...userData, department_id: e.target.value})} // instead of department
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
             value={userData.location_id}
             onChange={e => setUserData({...userData, location_id: e.target.value})}  // for location
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
           <Button variant="ghost" onClick={close}>Cancel</Button>
           <Button type="submit">Add User</Button>
         </div>
       </form>
     </div>
   </Dialog>
 )
}