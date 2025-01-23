// /app/components/ui/alert.tsx
import * as React from "react"

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  children,
  variant = 'default',
  className = '',
}: AlertProps) {
  const baseStyle = "rounded-lg border p-4"
  const variantStyles = {
    default: "bg-white border-gray-200",
    destructive: "bg-red-50 text-red-700 border-red-200"
  }

  return (
    <div className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>
}