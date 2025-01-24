// app/components/ui/dialog.tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

export function Dialog({
 children,
 open,
 onOpenChange
}: {
 children: React.ReactNode
 open: boolean
 onOpenChange: (open: boolean) => void
}) {
 return (
   <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
     <DialogPrimitive.Portal>
       <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
       <DialogPrimitive.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg">
         <div className="relative">
           <DialogPrimitive.Close className="absolute right-4 top-4">
             <X className="h-4 w-4" />
           </DialogPrimitive.Close>
           {children}
         </div>
       </DialogPrimitive.Content>
     </DialogPrimitive.Portal>
   </DialogPrimitive.Root>
 )
}