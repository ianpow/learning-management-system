// /app/learning-paths/[id]/page.tsx
import LearningPathDetail from '@/components/learning-path-detail'

interface LearningPathPageProps {
  params: {
    id: string
  }
}

export default function LearningPathPage({ params }: LearningPathPageProps) {
  return <LearningPathDetail pathId={parseInt(params.id)} />
}