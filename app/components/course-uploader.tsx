// /app/components/course-uploader.tsx
'use client'

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CourseData {
  title: string;
  description: string;
  is_mandatory: boolean;
  department_id: string;
  role_id: string;
}

interface UploadResponse {
  success: boolean;
  courseId?: number;
  error?: string;
}

const CourseUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    is_mandatory: false,
    department_id: '',
    role_id: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid SCORM package (.zip file)');
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a SCORM package');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // First, upload the SCORM package
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch('/api/courses/upload-scorm', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload SCORM package');
      }

      const { fileUrl } = await uploadResponse.json();

      // Then, create the course
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...courseData,
          scorm_package_url: fileUrl
        })
      });

      const result: UploadResponse = await response.json();

      if (result.success) {
        setSuccess(true);
        setCourseData({
          title: '',
          description: '',
          is_mandatory: false,
          department_id: '',
          role_id: ''
        });
        setFile(null);
        if (event.target instanceof HTMLFormElement) {
          event.target.reset();
        }
      } else {
        throw new Error(result.error || 'Failed to create course');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload course');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">Upload Course</h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Course uploaded successfully</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Course Title</label>
            <input
              type="text"
              value={courseData.title}
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                value={courseData.department_id}
                onChange={(e) => setCourseData({ ...courseData, department_id: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Department</option>
                {/* Department options would be populated here */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Required Role</label>
              <select
                value={courseData.role_id}
                onChange={(e) => setCourseData({ ...courseData, role_id: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Role</option>
                {/* Role options would be populated here */}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={courseData.is_mandatory}
                onChange={(e) => setCourseData({ ...courseData, is_mandatory: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Mandatory Course</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SCORM Package</label>
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
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseUploader;