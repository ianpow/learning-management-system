// /app/types/prisma.ts
import { Prisma } from '@prisma/client'

// Course include type 
export type CourseInclude = {
  enrollments?: boolean | Prisma.CourseEnrollmentDefaultArgs
  access_control?: boolean // Simplified since we just need boolean for includes
}

// Course where type
export type CourseWhere = {
  title?: { contains: string; mode: Prisma.QueryMode }
  access_control?: {
    some: {
      type: string
      departmentId?: number      
      roleId?: number           
      locationId?: number       
    }
  }
}

// Course create type
export type CourseCreate = {
  title: string
  description: string
  duration_minutes: number
  thumbnail_url?: string
  scorm_package_url: string
  created_by: { connect: { id: number } }
  status: string
  access_control?: {
    createMany: {
      data: {
        type: string
        departmentId?: number    
        roleId?: number         
        locationId?: number     
      }[]
    }
  }
}