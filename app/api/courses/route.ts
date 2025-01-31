// app/api/courses/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unzip } from 'unzipper'
import { XMLParser } from 'fast-xml-parser'
import { uploadFile } from '@/lib/file-upload'
import { Prisma } from '@prisma/client'
import type { DirectoryEntry } from 'unzipper'

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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Get user's role, department, and location
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        role_id: true,
        department_id: true,
        location_id: true,
        role: { select: { name: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Define query parameters
    const where = {
      AND: [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        user.role.name !== 'admin' ? {
          OR: [
            { department_id: user.department_id },
            {
              access_control: {
                some: {
                  OR: [
                    { type: 'ROLE', role_id: user.role_id },
                    { type: 'LOCATION', location_id: user.location_id }
                  ]
                }
              }
            }
          ]
        } : {}
      ]
    }

    const include = {
      enrollments: {
        where: {
          user_id: parseInt(session.user.id)
        },
        include: {
          progress: true
        }
      }
    }

    // Execute queries
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.course.count({ where })
    ])

    // Format response
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      duration_minutes: course.duration_minutes,
      thumbnail_url: course.thumbnail_url,
      enrolled_count: course.enrollments.length,
      is_enrolled: course.enrollments.length > 0,
      progress: course.enrollments[0]?.progress?.progress_percentage || 0
    }))

    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current_page: page,
        per_page: limit
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const scormPackage = formData.get('scormPackage') as File
    const thumbnail = formData.get('thumbnail') as File | null
    const courseData: CourseData = JSON.parse(formData.get('data') as string)

    // Validate required fields
    if (!scormPackage || !courseData.title || !courseData.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload thumbnail if provided
    let thumbnailUrl = ''
    if (thumbnail) {
      thumbnailUrl = await uploadFile(thumbnail)
    }

    // Process SCORM package
    const buffer = Buffer.from(await scormPackage.arrayBuffer())
    const directory = await unzip.Open.buffer(buffer)
    
    // Find and parse manifest
    const manifestFile = directory.files.find(f => f.path.endsWith('imsmanifest.xml'))
    if (!manifestFile) {
      return NextResponse.json({ error: 'Invalid SCORM package: No manifest file found' }, { status: 400 })
    }

    const manifestContent = await manifestFile.buffer()
    const parser = new XMLParser()
    const manifest = parser.parse(manifestContent.toString())

    // Validate manifest structure
    if (!manifest.manifest?.resources?.resource) {
      return NextResponse.json({ error: 'Invalid SCORM package: Invalid manifest structure' }, { status: 400 })
    }

    // Get launch URL from manifest
    const resource = Array.isArray(manifest.manifest.resources.resource)
      ? manifest.manifest.resources.resource[0]
      : manifest.manifest.resources.resource
    const launchUrl = resource.href || resource['@_href']
    if (!launchUrl) {
      return NextResponse.json({ error: 'Invalid SCORM package: No launch URL found' }, { status: 400 })
    }

    // Upload the unzipped content
    const uploadPromises = directory.files
      .filter(file => file.type !== 'Directory')
      .map(async file => {
        const content = await file.buffer()
        const path = `courses/${courseData.title}/${file.path}`
        return uploadFile(new File([content], file.path))
      })

    await Promise.all(uploadPromises)

    // Create course record with access control
    const createData = {
      title: courseData.title,
      description: courseData.description,
      duration_minutes: courseData.duration_minutes,
      thumbnail_url: thumbnailUrl,
      scorm_package_url: `courses/${courseData.title}/${launchUrl}`,
      created_by: {
        connect: { id: parseInt(session.user.id) }
      },
      status: 'active',
      access_control: {
        create: [
          ...courseData.access_control.departments.map(deptId => ({
            type: 'DEPARTMENT',
            departmentId: deptId
          })),
          ...courseData.access_control.roles.map(roleId => ({
            type: 'ROLE',
            roleId: roleId
          })),
          ...courseData.access_control.locations.map(locId => ({
            type: 'LOCATION',
            locationId: locId
          }))
        ]
      }
    }

    const course = await prisma.course.create({
      data: createData,
      include: {
        enrollments: true
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Course upload error:', error)
    return NextResponse.json({ error: 'Failed to upload course' }, { status: 500 })
  }
}