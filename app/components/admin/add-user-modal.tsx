// /app/components/admin/add-user-modal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AddUserModalProps {
 open: boolean
 onOpenChange: (open: boolean) => void
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
   first_name: '',
   last_name: '',
   role_id: '',
   department_id: '',
   location_id: '',
   password: ''
 })

 const [roles, setRoles] = useState<Role[]>([])
 const [departments, setDepartments] = useState<Department[]>([])
 const [locations, setLocations] = useState<Location[]>([])
 const [error, setError] = useState<string | null>(null)
 const [loading, setLoading] = useState(false)

 useEffect(() => {
   if (open) {
     const fetchData = async () => {
       setLoading(true)
       try {
         const [rolesRes, deptsRes, locsRes] = await Promise.all([
           fetch('/api/roles'),
           fetch('/api/departments'),
           fetch('/api/locations')
         ])

         const [rolesData, deptsData, locsData] = await Promise.all([
           rolesRes.ok ? rolesRes.json() : [],
           deptsRes.ok ? deptsRes.json() : [],
           locsRes.ok ? locsRes.json() : []
         ])

         setRoles(Array.isArray(rolesData) ? rolesData : [])
         setDepartments(Array.isArray(deptsData) ? deptsData : [])
         setLocations(Array.isArray(locsData) ? locsData : [])
       } catch (err) {
         console.error('Error fetching data:', err)
         setError('Failed to load form data')
       } finally {
         setLoading(false)
       }
     }
     fetchData()
   }
 }, [open])

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   setError(null)

   // Validate required fields
   if (!userData.email || !userData.password || !userData.first_name || 
       !userData.last_name || !userData.role_id || !userData.department_id || 
       !userData.location_id) {
     setError('All fields are required')
     return
   }

   try {
     // Log the data being sent
     console.log('Submitting user data:', userData)

     onSubmit(userData)
     onOpenChange(false)
   } catch (err) {
     console.error('Error submitting form:', err)
     setError('Failed to create user')
   }
 }

 if (loading) {
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <div className="p-6 w-[500px]">
         <div>Loading...</div>
       </div>
     </Dialog>
   )
 }

 return (
   <Dialog open={open} onOpenChange={onOpenChange}>
     <div className="p-6 w-[500px]">
       <h2 className="text-lg font-semibold mb-4">Add New User</h2>
       
       {error && (
         <Alert variant="destructive" className="mb-4">
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
               onChange={e => setUserData({...userData, first_name: e.target.value})}
             />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1">Last Name</label>
             <input
               type="text"
               required
               className="w-full p-2 border rounded"
               value={userData.last_name}
               onChange={e => setUserData({...userData, last_name: e.target.value})}
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
               onChange={e => setUserData({...userData, role_id: e.target.value})}
             >
               <option value="">Select Role</option>
               {Array.isArray(roles) && roles.map(role => role && (
                 <option key={role.id} value={role.id}>
                   {role?.name || 'Unnamed Role'}
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
               onChange={e => setUserData({...userData, department_id: e.target.value})}
             >
               <option value="">Select Department</option>
               {Array.isArray(departments) && departments.map(dept => dept && (
                 <option key={dept.id} value={dept.id}>
                   {dept?.name || 'Unnamed Department'}
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
             onChange={e => setUserData({...userData, location_id: e.target.value})}
           >
             <option value="">Select Location</option>
             {Array.isArray(locations) && locations.map(loc => loc && (
               <option key={loc.id} value={loc.id}>
                 {loc?.name || 'Unnamed Location'}
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
           <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
           <Button type="submit">Add User</Button>
         </div>
       </form>
     </div>
   </Dialog>
 )
}