// /app/admin/page.tsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/')
  }

  return <AdminDashboard />
}