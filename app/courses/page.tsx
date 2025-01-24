// app/courses/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/components/course-card'
import { Search, Filter } from 'lucide-react'

interface Course {
 id: number;
 title: string;
 description: string;
 thumbnail_url: string;
 duration_minutes: number;
 enrolled_count: number;
 is_enrolled?: boolean;
 progress?: number;
}

export default function CourseCatalog() {
 const [courses, setCourses] = useState<Course[]>([])
 const [loading, setLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState('')
 const [filter, setFilter] = useState('')

 useEffect(() => {
   fetchCourses()
 }, [])

 const fetchCourses = async () => {
   const res = await fetch('/api/courses')
   const data = await res.json()
   setCourses(data)
   setLoading(false)
 }

 const handleEnroll = async (courseId: number) => {
   await fetch('/api/courses/enroll', {
     method: 'POST',
     body: JSON.stringify({ courseId })
   })
   fetchCourses()
 }

 return (
   <div className="p-6">
     <div className="flex justify-between mb-6">
       <div className="relative w-96">
         <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
         <input
           type="text"
           placeholder="Search courses..."
           className="pl-10 pr-4 py-2 w-full border rounded-md"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>
       <select 
         value={filter}
         onChange={(e) => setFilter(e.target.value)}
         className="border rounded-md px-3"
       >
         <option value="">All Courses</option>
         <option value="enrolled">Enrolled</option>
         <option value="not-enrolled">Not Enrolled</option>
       </select>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {courses
         .filter(course => 
           course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (filter === '' || 
            (filter === 'enrolled' && course.is_enrolled) ||
            (filter === 'not-enrolled' && !course.is_enrolled))
         )
         .map(course => (
           <Course
             key={course.id}
             course={course}
             onEnroll={() => handleEnroll(course.id)}
           />
         ))}
     </div>
   </div>
 )
}