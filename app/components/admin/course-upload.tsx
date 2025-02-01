// /app/components/admin/course-upload.tsx
'use client'

import { useState, useEffect } from 'react'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Department {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
}

interface Location {
  id: number
  name: string
}

interface CourseData {
  title: string
  description: string
  duration_minutes: number
  thumbnail_url?: string
  access_control: {
    departments: number[]
    roles: number[]
    locations: number[]
  }
}

export default function CourseUpload() {
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    duration_minutes: 0,
    thumbnail_url: '',
    access_control: {
      departments: [],
      roles: [],
      locations: []
    }
  })

  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsRes, rolesRes, locsRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/roles'),
          fetch('/api/locations')
        ])

        if (!deptsRes.ok || !rolesRes.ok || !locsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [deptsData, rolesData, locsData] = await Promise.all([
          deptsRes.json(),
          rolesRes.json(),
          locsRes.json()
        ])

        setDepartments(deptsData)
        setRoles(rolesData)
        setLocations(locsData)
      } catch (err) {
        setError('Failed to load form data')
      }
    }

    fetchData()
  }, [])

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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file)
      setError('')
    } else {
      setError('Please upload a valid image file')
      setThumbnailFile(null)
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

    try {
      // Upload SCORM package
      const scormResponse = await fetch('/api/courses/upload-url', {
        method: 'POST',
        body: file,
        headers: {
          'upload-type': 'scorm',
          'file-name': file.name
        }
      })

      if (!scormResponse.ok) {
        throw new Error('Failed to upload SCORM package')
      }

      const { url: scormUrl } = await scormResponse.json()

      // Upload thumbnail if provided
      let thumbnailUrl = ''
      if (thumbnailFile) {
        const thumbnailResponse = await fetch('/api/courses/upload-url', {
          method: 'POST',
          body: thumbnailFile,
          headers: {
            'upload-type': 'thumbnail',
            'file-name': thumbnailFile.name
          }
        })

        if (!thumbnailResponse.ok) {
          throw new Error('Failed to upload thumbnail')
        }

        const { url } = await thumbnailResponse.json()
        thumbnailUrl = url
      }

      // Create course record
      const formData = new FormData()
      formData.append('data', JSON.stringify({
        ...courseData,
        thumbnail_url: thumbnailUrl,
        scorm_package_url: scormUrl
      }))

      const response = await fetch('/api/courses', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to create course')
      
      setSuccess(true)
      // Reset form
      setCourseData({
        title: '',
        description: '',
        duration_minutes: 0,
        thumbnail_url: '',
        access_control: {
          departments: [],
          roles: [],
          locations: []
        }
      })
      setFile(null)
      setThumbnailFile(null)
    } catch (err) {
      setError('Failed to upload course')
      console.error('Upload error:', err)
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Course uploaded successfully</AlertDescription>
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
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            required
            min="1"
            className="w-full p-2 border rounded"
            value={courseData.duration_minutes}
            onChange={e => setCourseData({...courseData, duration_minutes: Number(e.target.value)})}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Course Access</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Available to Departments</label>
            <select
              multiple
              className="w-full p-2 border rounded"
              value={courseData.access_control.departments.map(String)}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions)
                const selectedIds = selectedOptions.map(option => Number(option.value))
                setCourseData({
                  ...courseData,
                  access_control: {
                    ...courseData.access_control,
                    departments: selectedIds
                  }
                })
              }}
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Available to Roles</label>
            <select
              multiple
              className="w-full p-2 border rounded"
              value={courseData.access_control.roles.map(String)}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions)
                const selectedIds = selectedOptions.map(option => Number(option.value))
                setCourseData({
                  ...courseData,
                  access_control: {
                    ...courseData.access_control,
                    roles: selectedIds
                  }
                })
              }}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id.toString()}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Available to Locations</label>
            <select
              multiple
              className="w-full p-2 border rounded"
              value={courseData.access_control.locations.map(String)}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions)
                const selectedIds = selectedOptions.map(option => Number(option.value))
                setCourseData({
                  ...courseData,
                  access_control: {
                    ...courseData.access_control,
                    locations: selectedIds
                  }
                })
              }}
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id.toString()}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full"
            />
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