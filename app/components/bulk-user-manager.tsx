// app/components/bulk-user-manager.tsx
'use client'

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { Button } from '@/components/ui/button';

interface User {
 email: string;
 first_name: string;
 last_name: string;
 department_id: string;
 role_id: string;
 location_id: string;
 manager_id?: string;
}

interface ImportResults {
 success: boolean;
 imported: number;
 failed: number;
 errors: string[];
}

const BulkUserManager = () => {
 const [file, setFile] = useState<File | null>(null);
 const [importing, setImporting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);
 const [preview, setPreview] = useState<User[] | null>(null);

 const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
   const selectedFile = event.target.files?.[0];
   if (!selectedFile) return;

   if (!selectedFile.name.endsWith('.csv')) {
     setError('Please upload a CSV file');
     return;
   }

   Papa.parse(selectedFile, {
    header: true,
    complete: (results: ParseResult<User>) => {
      if (results.errors.length > 0) {
        setError('Error parsing CSV file');
        return;
      }
      setFile(selectedFile);
      setPreview(results.data);
      setError(null);
    }
  });
 };

 const handleImport = async () => {
   if (!file || !preview) return;

   setImporting(true);
   setError(null);
   setSuccessMessage(null);

   try {
     const formData = new FormData();
     formData.append('file', file);

     const response = await fetch('/api/users/bulk-import', {
       method: 'POST',
       body: formData
     });

     if (!response.ok) {
       throw new Error('Import failed');
     }

     const result: ImportResults = await response.json();
     
     if (result.success) {
       setSuccessMessage(`Successfully imported ${result.imported} users`);
       setPreview(null);
       setFile(null);
     } else {
       setError(`Failed to import users: ${result.errors.join(', ')}`);
     }
   } catch (err) {
     setError(err instanceof Error ? err.message : 'Failed to import users');
   } finally {
     setImporting(false);
   }
 };

 return (
   <div className="max-w-4xl mx-auto space-y-6">
     <div className="bg-white p-6 rounded-lg shadow">
       <h2 className="text-xl font-bold mb-6">Bulk User Import</h2>

       {error && (
         <Alert variant="destructive" className="mb-6">
           <AlertCircle className="h-4 w-4" />
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}

       {successMessage && (
         <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
           <CheckCircle className="h-4 w-4" />
           <AlertDescription>{successMessage}</AlertDescription>
         </Alert>
       )}

       <div className="space-y-6">
         <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
           <input
             type="file"
             accept=".csv"
             onChange={handleFileUpload}
             className="hidden"
             id="file-upload"
           />
           <label
             htmlFor="file-upload"
             className="flex flex-col items-center cursor-pointer"
           >
             <Upload className="h-12 w-12 text-gray-400" />
             <p className="mt-2 text-sm text-gray-600">
               Click to upload or drag and drop
             </p>
             <p className="text-xs text-gray-500">CSV files only</p>
           </label>
           {file && (
             <p className="mt-2 text-sm text-gray-600 text-center">
               Selected file: {file.name}
             </p>
           )}
         </div>

         <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-bold">Bulk User Import</h2>
  <Button
onClick={async () => {
  const response = await fetch('/api/users/bulk-import/template');  // Updated path
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'user-import-template.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}}
  >
    Download Template
  </Button>
</div>

         {preview && preview.length > 0 && (
           <div>
             <h3 className="text-lg font-semibold mb-2">Preview</h3>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                       Email
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                       Name
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                       Department
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                       Role
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {preview.slice(0, 5).map((user, index) => (
                     <tr key={index}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                         {user.email}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                         {`${user.first_name} ${user.last_name}`}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                         {user.department_id}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                         {user.role_id}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className="mt-4 flex justify-end space-x-2">
             <Button
            onClick={() => {
              setPreview(null);
              setFile(null);
            }}
            variant="ghost"
            className="text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import Users'}
          </Button>
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default BulkUserManager;