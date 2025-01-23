// /app/courses/[id]/player/page.tsx
import ScormPlayer from '@/components/scorm-player'

interface ScormPlayerPageProps {
  params: {
    id: string
  }
}

export default function ScormPlayerPage({ params }: ScormPlayerPageProps) {
  return <ScormPlayer courseId={parseInt(params.id)} />
}