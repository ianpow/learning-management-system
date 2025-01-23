// /app/courses/[id]/page.tsx
import CourseDetail from '@/components/course-detail'

interface CourseDetailPageProps {
  params: {
    id: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  return <CourseDetail courseId={parseInt(params.id)} />
}