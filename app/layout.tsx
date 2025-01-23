// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import DashboardLayout from '@/components/dashboard-ui'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Learning Management System',
  description: 'Enterprise Learning Management System'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </Providers>
      </body>
    </html>
  )
}