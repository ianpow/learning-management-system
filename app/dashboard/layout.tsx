// app/dashboard/layout.tsx
import Dashboard from '@/components/dashboard-ui'

export default function Layout({
 children,
}: {
 children: React.ReactNode
}) {
 return <Dashboard>{children}</Dashboard>
}