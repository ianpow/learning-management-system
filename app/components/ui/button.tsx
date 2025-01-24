// app/components/ui/button.tsx
import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: 'default' | 'ghost' | 'destructive'
 size?: 'default' | 'sm' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
   const variants = {
     default: 'bg-blue-600 text-white hover:bg-blue-700',
     ghost: 'hover:bg-gray-100',
     destructive: 'bg-red-600 text-white hover:bg-red-700'
   }

   const sizes = {
     default: 'px-4 py-2',
     sm: 'px-2 py-1 text-sm',
     lg: 'px-6 py-3 text-lg'
   }

   return (
     <button
       ref={ref}
       className={`rounded-md font-medium ${variants[variant]} ${sizes[size]} ${className}`}
       {...props}
     />
   )
 }
)

Button.displayName = 'Button'