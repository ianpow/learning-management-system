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

interface DashboardLayoutProps {
  children: ReactNode;
  onNavigate?: (path: string) => void;
  currentUser?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

const DashboardLayout = ({ 
  children, 
  onNavigate = () => {}, 
  currentUser = {} 
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const userRole = currentUser?.role || '';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/courses' },
    { icon: GraduationCap, label: 'Learning Paths', path: '/learning-paths' },
  ];

  if (['admin', 'manager'].includes(userRole)) {
    menuItems.push(
      { icon: Users, label: 'Team Progress', path: '/team-progress' }
    );
  }

  if (userRole === 'admin') {
    menuItems.push(
      { icon: Settings, label: 'Settings', path: '/settings' }
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        <div className="p-4">
          <img 
            src="/api/placeholder/150/50" 
            alt="Hotel Group Logo" 
            className="mx-auto h-12"
          />
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.path)}
              className="w-full flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {isSidebarOpen && (
                <span className="ml-3">{item.label}</span>
              )}
            </button>
          ))}
          
          <button
            onClick={() => onNavigate('/logout')}
            className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition-colors mt-auto"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && (
              <span className="ml-3">Logout</span>
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <LayoutDashboard className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-sm text-gray-500">
                  {currentUser?.email || 'user@example.com'}
                </div>
              </div>
              <img 
                src="/api/placeholder/40/40" 
                alt="Profile" 
                className="h-10 w-10 rounded-full"
              />
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
