// app/api/courses/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface CourseData {
  title: string
  description: string
  duration_minutes: number
  thumbnail_url?: string
  scorm_package_url: string
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
    console.log('Starting POST request processing');
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'admin') {
      console.log('Authorization failed:', session?.user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Received request data:', data);

    // Validate required fields
    if (!data.title || !data.description || !data.scorm_package_url) {
      console.log('Missing required fields:', {
        title: !!data.title,
        description: !!data.description,
        scorm_package_url: !!data.scorm_package_url
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create course record with access control
    const createData = {
      title: data.title,
      description: data.description,
      duration_minutes: data.duration_minutes,
      thumbnail_url: data.thumbnail_url || '',
      scorm_package_url: data.scorm_package_url,
      created_by: {
        connect: { id: parseInt(session.user.id) }
      },
      status: 'active',
      access_control: {
        create: [
          ...data.access_control.departments.map((deptId: number) => ({
            type: 'DEPARTMENT',
            departmentId: deptId
          })),
          ...data.access_control.roles.map((roleId: number) => ({
            type: 'ROLE',
            roleId: roleId
          })),
          ...data.access_control.locations.map((locId: number) => ({
            type: 'LOCATION',
            locationId: locId
          }))
        ]
      }
    }

    console.log('Attempting to create course with data:', createData);

    try {
      const course = await prisma.course.create({
        data: createData,
        include: {
          enrollments: true
        }
      })
      console.log('Course created successfully:', course);
      return NextResponse.json(course)
    } catch (prismaError) {
      console.error('Prisma error during course creation:', prismaError);
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error code:', prismaError.code);
        console.error('Prisma error meta:', prismaError.meta);
      }
      return NextResponse.json({ 
        error: 'Database error', 
        details: prismaError,
        message: prismaError instanceof Error ? prismaError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Course upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload course', 
      details: error,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}