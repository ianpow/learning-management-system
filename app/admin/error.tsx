'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Something went wrong loading the admin page.
      </AlertDescription>
    </Alert>
  )
}