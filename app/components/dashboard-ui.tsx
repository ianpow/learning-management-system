// app/components/dashboard-ui.tsx
'use client'

import React, { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (path === '/logout') {
      signOut();
    } else {
      router.push(path);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/courses' },
    { icon: GraduationCap, label: 'Learning Paths', path: '/learning-paths' },
    { icon: Users, label: 'Team Progress', path: '/team-progress' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`bg-white shadow-lg ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        <div className="p-4">
          <img 
            src="/api/placeholder/150/50" 
            alt="Logo" 
            className="mx-auto h-12"
          />
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(item.path)}
              className="w-full flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {isSidebarOpen && (
                <span className="ml-3">{item.label}</span>
              )}
            </button>
          ))}
          
          <button
            onClick={() => handleNavigate('/logout')}
            className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition-colors mt-auto"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && (
              <span className="ml-3">Logout</span>
            )}
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;