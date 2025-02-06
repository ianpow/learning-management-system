// app/components/dashboard-ui.tsx
'use client'

import React, { ReactNode } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  Bell,
  User,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavigate = (path: string) => {
    if (path === '/logout') {
      signOut();
    } else {
      router.push(path);
    }
    setIsMenuOpen(false);
  };

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/courses' },
    { icon: GraduationCap, label: 'Learning Paths', path: '/learning-paths' }
  ];

  if (userRole === 'admin') {
    menuItems.push(
      { icon: Settings, label: 'Admin', path: '/admin' }
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-gray-200">
        <div className="h-16 mx-auto px-4 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-semibold text-blue-600">LMS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigate(item.path)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleNavigate('/logout')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-2 px-4 space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleNavigate('/logout')}
                className="w-full flex items-center px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;