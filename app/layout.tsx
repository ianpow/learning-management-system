// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { Providers } from './providers'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Learning Management System',
  description: 'Enterprise Learning Management System',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`min-h-screen bg-background font-sans antialiased ${fontSans.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}