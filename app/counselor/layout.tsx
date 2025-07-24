'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { counselorNavItems } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    setMounted(true);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Enhanced loading screen
  if (loading || !user || !mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="relative">
          {/* Animated background */}
          <div className="absolute inset-0 -m-8">
            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-r from-violet-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-lg animate-pulse delay-700" />
          </div>
          
          <div className="relative flex flex-col items-center gap-4 p-8">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
              <div className="absolute inset-0 h-12 w-12 border-2 border-violet-200 rounded-full animate-ping" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loading Counselor Portal</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Preparing your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced role check with better UX
  if (user.role !== 'counselor') {
    if (user.role === 'student') {
      router.replace('/student/dashboard');
    } else {
      router.replace('/login');
    }
    
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950">
        <div className="text-center p-8">
          <div className="relative mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Redirecting...</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user.role === 'student' ? 'Taking you to student dashboard' : 'Unauthorized access'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-violet-50/50 via-white to-cyan-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-8 w-64 h-64 bg-gradient-to-r from-violet-400/5 to-purple-600/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-8 w-48 h-48 bg-gradient-to-r from-cyan-400/5 to-blue-600/5 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-pink-400/5 to-rose-600/5 rounded-full blur-xl animate-pulse delay-2000" />
        </div>

        <div className="flex h-full relative z-10">
          {/* Desktop Sidebar - Fixed width, not overlaying */}
          {!isMobile && (
            <SidebarNav 
              navItems={counselorNavItems} 
              userRole="counselor" 
              isMobile={false}
              isCollapsed={!sidebarOpen}
              showLabels={sidebarOpen}
            />
          )}

          {/* Mobile Sidebar - Overlay */}
          {isMobile && (
            <SidebarNav 
              navItems={counselorNavItems} 
              userRole="counselor" 
              isMobile={true}
            />
          )}

          {/* Main Content Area - Flex grows to fill remaining space */}
          <div className={cn(
            "flex-1 flex flex-col min-w-0 relative",
            isMobile && "w-full"
          )}>
            {/* Enhanced Header */}
            <Header 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen}
              className="relative z-10 flex-shrink-0"
            />

            {/* Main Content with Premium Styling */}
            <main className="flex-1 overflow-auto relative">
              {/* Content background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-violet-50/30 to-cyan-50/60 dark:from-gray-900/60 dark:via-indigo-950/30 dark:to-gray-950/60" />
              
              {/* Content container */}
              <div className="relative z-10 h-full">
                <div className={cn(
                  "p-4 sm:p-6 lg:p-8 max-w-full h-full",
                  isMobile && "pt-16" // Account for mobile menu button
                )}>
                  <div className="mx-auto h-full">
                    {/* Content wrapper with subtle animations */}
                    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 h-full">
                      {children}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating action hint for collapsed sidebar - Desktop only */}
              {!sidebarOpen && !isMobile && (
                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-violet-200/50 dark:border-violet-800/50 animate-in slide-in-from-left-8 duration-500">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Click to expand sidebar
                  </span>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}