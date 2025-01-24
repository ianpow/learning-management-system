// app/learning-paths/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface Course {
 id: number;
 title: string;
 duration_minutes: number;
 completion_status: 'not_started' | 'in_progress' | 'completed';
}

interface LearningPath {
 id: number;
 title: string;
 description: string;
 courses: Course[];
 progress: number;
}

export default function LearningPaths() {
 const [paths, setPaths] = useState<LearningPath[]>([])
 const [expandedPath, setExpandedPath] = useState<number | null>(null)

 useEffect(() => {
   fetchPaths()
 }, [])

 const fetchPaths = async () => {
   const res = await fetch('/api/learning-paths')
   const data = await res.json()
   setPaths(data)
 }

 return (
   <div className="p-6 space-y-6">
     {paths.map(path => (
       <div key={path.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
         <div 
           className="p-4 flex justify-between items-center cursor-pointer"
           onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
         >
           <div>
             <h3 className="font-semibold text-lg">{path.title}</h3>
             <p className="text-gray-600">{path.description}</p>
           </div>
           <ChevronDown className={`transform transition-transform ${
             expandedPath === path.id ? 'rotate-180' : ''
           }`} />
         </div>

         {expandedPath === path.id && (
           <div className="p-4 border-t">
             <div className="mb-4">
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div 
                   className="bg-blue-600 h-2 rounded-full transition-all"
                   style={{ width: `${path.progress}%` }}
                 />
               </div>
               <p className="text-sm text-gray-600 mt-1">
                 {path.progress}% Complete
               </p>
             </div>

             <div className="space-y-4">
               {path.courses.map((course, index) => (
                 <div 
                   key={course.id}
                   className={`p-4 rounded-lg border ${
                     course.completion_status === 'completed'
                       ? 'bg-green-50 border-green-200'
                       : course.completion_status === 'in_progress'
                       ? 'bg-blue-50 border-blue-200'
                       : 'bg-gray-50 border-gray-200'
                   }`}
                 >
                   <div className="flex justify-between items-center">
                     <div>
                       <div className="flex items-center">
                         <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
                           {index + 1}
                         </span>
                         <h4 className="font-medium">{course.title}</h4>
                       </div>
                       <p className="text-sm text-gray-600 mt-1">
                         {course.duration_minutes} minutes
                       </p>
                     </div>

                     {course.completion_status !== 'not_started' && (
                       <Link
                         href={`/courses/${course.id}`}
                         className="flex items-center text-blue-600 hover:text-blue-800"
                       >
                         {course.completion_status === 'completed' 
                           ? 'Review' 
                           : 'Continue'
                         }
                         <ArrowRight className="ml-2 h-4 w-4" />
                       </Link>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}
       </div>
     ))}
   </div>
 )
}