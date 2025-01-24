// app/components/admin/reports.tsx
'use client'

import { useState, useEffect } from 'react'
import {
 BarChart, Bar, LineChart, Line,
 XAxis, YAxis, CartesianGrid, Tooltip, Legend,
 ResponsiveContainer
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

interface ReportData {
 completionRates: {
   course: string;
   rate: number;
 }[];
 userProgress: {
   user: string;
   completed: number;
   inProgress: number;
 }[];
 monthlyEnrollments: {
   month: string;
   enrollments: number;
   completions: number;
 }[];
}

export default function Reports() {
 const [data, setData] = useState<ReportData | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [dateRange, setDateRange] = useState({
   start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
   end: new Date().toISOString().split('T')[0]
 })

 useEffect(() => {
   fetchReportData()
 }, [dateRange])

 const fetchReportData = async () => {
   try {
     const response = await fetch(
       `/api/reports?start=${dateRange.start}&end=${dateRange.end}`
     )
     if (!response.ok) throw new Error('Failed to fetch report data')
     const data = await response.json()
     setData(data)
   } catch (err) {
     setError('Failed to load report data')
   } finally {
     setLoading(false)
   }
 }

 const exportReport = async (format: 'csv' | 'pdf') => {
   try {
     const response = await fetch(
       `/api/reports/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}`,
       { method: 'POST' }
     )
     if (!response.ok) throw new Error('Failed to export report')
     
     const blob = await response.blob()
     const url = window.URL.createObjectURL(blob)
     const a = document.createElement('a')
     a.href = url
     a.download = `report.${format}`
     document.body.appendChild(a)
     a.click()
     window.URL.revokeObjectURL(url)
     document.body.removeChild(a)
   } catch (err) {
     setError('Failed to export report')
   }
 }

 if (loading) return <div>Loading...</div>
 if (error) return <Alert variant="destructive">{error}</Alert>
 if (!data) return <Alert>No data available</Alert>

 return (
   <div className="space-y-6">
     <div className="flex justify-between items-center">
       <div className="flex gap-4">
         <input
           type="date"
           value={dateRange.start}
           onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
           className="border rounded px-3 py-2"
         />
         <input
           type="date"
           value={dateRange.end}
           onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
           className="border rounded px-3 py-2"
         />
       </div>
       <div className="flex gap-2">
         <Button onClick={() => exportReport('csv')}>Export CSV</Button>
         <Button onClick={() => exportReport('pdf')}>Export PDF</Button>
       </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white p-6 rounded-lg shadow">
         <h3 className="text-lg font-semibold mb-4">Course Completion Rates</h3>
         <div className="h-80">
           <ResponsiveContainer>
             <BarChart data={data.completionRates}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="course" />
               <YAxis />
               <Tooltip />
               <Bar dataKey="rate" fill="#4F46E5" name="Completion Rate %" />
             </BarChart>
           </ResponsiveContainer>
         </div>
       </div>

       <div className="bg-white p-6 rounded-lg shadow">
         <h3 className="text-lg font-semibold mb-4">Monthly Activity</h3>
         <div className="h-80">
           <ResponsiveContainer>
             <LineChart data={data.monthlyEnrollments}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="month" />
               <YAxis />
               <Tooltip />
               <Legend />
               <Line type="monotone" dataKey="enrollments" stroke="#4F46E5" name="Enrollments" />
               <Line type="monotone" dataKey="completions" stroke="#10B981" name="Completions" />
             </LineChart>
           </ResponsiveContainer>
         </div>
       </div>
     </div>
   </div>
 )
}