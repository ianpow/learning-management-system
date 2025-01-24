// app/components/admin/course-upload.tsx
'use client'

import { useState } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface CourseData {
 title: string
 description: string
 department: string
 isMandatory: boolean
 scormPackage?: File
}

export default function CourseUpload() {
 const [courseData, setCourseData] = useState<CourseData>({
   title: '',
   description: '',
   department: '',
   isMandatory: false
 })
 const [file, setFile] = useState<File | null>(null)
 const [uploading, setUploading] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState(false)

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0]
   if (file && file.name.endsWith('.zip')) {
     setFile(file)
     setError('')
   } else {
     setError('Please upload a valid SCORM package (.zip)')
     setFile(null)
   }
 }

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   if (!file) {
     setError('Please upload a SCORM package')
     return
   }

   setUploading(true)
   setError('')
   setSuccess(false)

   const formData = new FormData()
   formData.append('scormPackage', file)
   formData.append('data', JSON.stringify(courseData))

   try {
     const response = await fetch('/api/courses', {
       method: 'POST',
       body: formData
     })

     if (!response.ok) throw new Error('Failed to upload course')
     
     setSuccess(true)
     setCourseData({
       title: '',
       description: '',
       department: '',
       isMandatory: false
     })
     setFile(null)
   } catch (err) {
     setError('Failed to upload course')
   } finally {
     setUploading(false)
   }
 }

 return (
   <div className="max-w-2xl mx-auto">
     <form onSubmit={handleSubmit} className="space-y-6">
       {error && (
         <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           {error}
         </Alert>
       )}

       {success && (
         <Alert className="bg-green-50 border-green-200 text-green-800">
           Course uploaded successfully
         </Alert>
       )}

       <div>
         <label className="block text-sm font-medium mb-1">Course Title</label>
         <input
           type="text"
           required
           className="w-full p-2 border rounded"
           value={courseData.title}
           onChange={e => setCourseData({...courseData, title: e.target.value})}
         />
       </div>

       <div>
         <label className="block text-sm font-medium mb-1">Description</label>
         <textarea
           required
           className="w-full p-2 border rounded"
           rows={4}
           value={courseData.description}
           onChange={e => setCourseData({...courseData, description: e.target.value})}
         />
       </div>

       <div>
         <label className="block text-sm font-medium mb-1">Department</label>
         <select
           required
           className="w-full p-2 border rounded"
           value={courseData.department}
           onChange={e => setCourseData({...courseData, department: e.target.value})}
         >
           <option value="">Select Department</option>
           <option value="HR">HR</option>
           <option value="IT">IT</option>
           <option value="Sales">Sales</option>
         </select>
       </div>

       <div className="flex items-center">
         <input
           type="checkbox"
           id="mandatory"
           checked={courseData.isMandatory}
           onChange={e => setCourseData({...courseData, isMandatory: e.target.checked})}
           className="mr-2"
         />
         <label htmlFor="mandatory">Mandatory Course</label>
       </div>

       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
         <input
           type="file"
           accept=".zip"
           onChange={handleFileChange}
           className="hidden"
           id="scorm-upload"
         />
         <label
           htmlFor="scorm-upload"
           className="flex flex-col items-center cursor-pointer"
         >
           <Upload className="h-12 w-12 text-gray-400" />
           <p className="mt-2 text-sm text-gray-600">
             Click to upload or drag and drop
           </p>
           <p className="text-xs text-gray-500">SCORM packages only (.zip)</p>
         </label>
         {file && (
           <p className="mt-2 text-sm text-gray-600 text-center">
             Selected file: {file.name}
           </p>
         )}
       </div>

       <Button
         type="submit"
         disabled={uploading}
         className="w-full"
       >
         {uploading ? 'Uploading...' : 'Upload Course'}
       </Button>
     </form>
   </div>
 )
}