// /app/components/notification-bell.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Notification, NotificationResponse } from '@/types/notifications';

const NotificationBell: React.FC = () => {
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const { data: session } = useSession();

 const { data, mutate } = useSWR(
   session?.user ? '/api/notifications' : null,
   url => fetch(url).then(res => res.json()),
   { refreshInterval: 5000 }
 );

 const notifications = data?.notifications || [];
 const unreadCount = notifications.filter((n: Notification) => !n.read).length;

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
       setIsOpen(false);
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const fetchNotifications = async () => {
   try {
     const response = await fetch('/api/notifications');
     if (!response.ok) throw new Error('Failed to fetch notifications');
     const data = await response.json();
     mutate(data);
   } catch (error) {
     console.error('Failed to fetch notifications:', error);
   }
 };

 const markAsRead = async (notificationId: number) => {
   try {
     const response = await fetch(`/api/notifications/${notificationId}/read`, {
       method: 'POST'
     });
     if (!response.ok) throw new Error('Failed to mark notification as read');
     
     mutate();
   } catch (error) {
     console.error('Failed to mark notification as read:', error);
   }
 };

 const markAllAsRead = async () => {
   try {
     const response = await fetch('/api/notifications/mark-all-read', {
       method: 'POST'
     });
     if (!response.ok) throw new Error('Failed to mark all notifications as read');
     
     mutate();
   } catch (error) {
     console.error('Failed to mark all notifications as read:', error);
   }
 };

 if (!session?.user) {
   return null;
 }

 return (
   <div className="relative" ref={dropdownRef}>
     <button
       onClick={() => setIsOpen(!isOpen)}
       className="relative p-2 text-gray-600 hover:text-gray-900"
     >
       <Bell className="h-6 w-6" />
       {unreadCount > 0 && (
         <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
           {unreadCount}
         </span>
       )}
     </button>

     {isOpen && (
       <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
         <div className="p-4 border-b">
           <div className="flex justify-between items-center">
             <h3 className="font-semibold">Notifications</h3>
             {unreadCount > 0 && (
               <button
                 onClick={markAllAsRead}
                 className="text-sm text-blue-600 hover:text-blue-800"
               >
                 Mark all as read
               </button>
             )}
           </div>
         </div>

         <div className="max-h-96 overflow-y-auto">
           {notifications.length === 0 ? (
             <div className="p-4 text-center text-gray-500">
               No notifications
             </div>
           ) : (
            notifications.map((notification: Notification) => (
               <div
                 key={notification.id}
                 className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                   !notification.read ? 'bg-blue-50' : ''
                 }`}
               >
                 <div className="flex justify-between items-start">
                   <div className="flex-1">
                     <p className="text-sm">{notification.content}</p>
                     <p className="text-xs text-gray-500 mt-1">
                       {new Date(notification.created_at).toLocaleDateString()}
                     </p>
                   </div>
                   {!notification.read && (
                     <button
                       onClick={() => markAsRead(notification.id)}
                       className="text-xs text-blue-600 hover:text-blue-800"
                     >
                       Mark as read
                     </button>
                   )}
                 </div>
               </div>
             ))
           )}
         </div>
       </div>
     )}
   </div>
 );
};

export default NotificationBell;