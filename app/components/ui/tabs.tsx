// app/components/ui/tabs.tsx
'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import React from 'react'

const Tabs = TabsPrimitive.Root

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsTriggerProps extends TabsPrimitive.TabsTriggerProps {}
interface TabsContentProps extends TabsPrimitive.TabsContentProps {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
 (props, ref) => (
   <TabsPrimitive.List
     ref={ref}
     className="flex gap-4 border-b border-gray-200"
     {...props}
   />
 )
)
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
 (props, ref) => (
   <TabsPrimitive.Trigger
     ref={ref}
     className="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-600"
     {...props}
   />
 )
)
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
 (props, ref) => (
   <TabsPrimitive.Content
     ref={ref}
     className="mt-4"
     {...props}
   />
 )
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }