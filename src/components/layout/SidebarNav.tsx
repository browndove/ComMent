'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar, SidebarTooltip } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { Button } from '@/components/ui/button';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  LogOut, 
  X,
  Menu
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

interface SidebarNavProps {
  navItems: NavItem[];
  userRole: 'student' | 'counselor';
}

export function SidebarNav({ navItems, userRole }: SidebarNavProps) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobileState] = useState(false);

  // Handle client-side mounting and mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileState(window.innerWidth < 768);
    };
    
    checkMobile();
    setIsMounted(true);
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [pathname, isMobile, isOpen, setIsOpen]);

  // Close mobile sidebar on outside click
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const trigger = document.getElementById('mobile-sidebar-trigger');
      
      if (sidebar && !sidebar.contains(event.target as Node) && 
          trigger && !trigger.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile, setIsOpen]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderNavItems = () => (
    <>
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <SidebarTooltip key={item.href} label={item.title} disabled={isOpen || isMobile}>
            <Link
              href={item.disabled ? '#' : item.href}
              className={cn(
                "group relative w-full flex items-center transition-all duration-300 ease-in-out",
                "rounded-xl text-sm font-medium select-none",
                isOpen || isMobile ? "p-3 gap-3" : "p-3 justify-center",
                isActive
                  ? "bg-primary/15 text-primary shadow-sm border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:shadow-sm",
                item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
                !isActive && "hover:translate-x-0.5"
              )}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
              onClick={(e) => {
                if (item.disabled) e.preventDefault();
                if (isMobile) setIsOpen(false);
              }}
            >
              <div className={cn(
                "flex items-center justify-center shrink-0 transition-all duration-300",
                                  isOpen || isMobile ? "w-5 h-5" : "w-6 h-6"
              )}>
                <item.icon className={cn(
                  "transition-all duration-300",
                  isOpen || isMobile ? "h-5 w-5" : "h-6 w-6",
                  "group-hover:scale-110",
                  isActive && "drop-shadow-sm"
                )} />
              </div>
              
              <span className={cn(
                'font-medium transition-all duration-300 ease-in-out',
                isOpen || isMobile 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 -translate-x-2 absolute pointer-events-none w-0 overflow-hidden"
              )}>
                {item.title}
              </span>
              
              {/* Active indicator - only show when sidebar is open or on mobile */}
              {isActive && (isOpen || isMobile) && (
                <div className="absolute right-2 w-2 h-2 bg-primary rounded-full transition-all duration-300" />
              )}
            </Link>
          </SidebarTooltip>
        );
      })}
    </>
  );

  const renderContent = () => (
    <div className="flex h-full flex-col bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-border/40 transition-all duration-300",
        isOpen || isMobile ? "h-16 px-4 justify-between" : "h-16 px-3 justify-center"
      )}>
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen || isMobile 
            ? "opacity-100 scale-100" 
            : "opacity-0 scale-95 absolute pointer-events-none"
        )}>
          <AppLogo />
        </div>
        
        {/* Desktop toggle button */}
        {!isMobile && (
          <SidebarTooltip label={isOpen ? "Collapse sidebar" : "Expand sidebar"}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-all duration-300 hover:bg-muted/80",
                isOpen ? "h-9 w-9" : "h-10 w-10"
              )}
              onClick={handleToggle}
            >
              {isOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>
          </SidebarTooltip>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted/80"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        isOpen || isMobile ? "px-3 py-4" : "px-2 py-4",
        "space-y-2",
        "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
      )}>
        {renderNavItems()}
      </nav>

      {/* User section & Logout */}
      <div className={cn(
        "border-t border-border/40 transition-all duration-300",
        isOpen || isMobile ? "px-3 py-4" : "px-2 py-4"
      )}>
        {/* User role badge */}
        {(isOpen || isMobile) && (
          <div className="mb-3 px-3 py-2 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {userRole}
            </p>
          </div>
        )}

        <SidebarTooltip label="Sign out" disabled={isOpen || isMobile}>
          <button
            onClick={handleLogout}
            className={cn(
              "group relative w-full flex items-center transition-all duration-300 ease-in-out",
              "rounded-xl text-sm font-medium",
              isOpen || isMobile ? "p-3 gap-3" : "p-3 justify-center",
              "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              "hover:shadow-sm hover:translate-x-0.5"
            )}
          >
            <div className={cn(
              "flex items-center justify-center shrink-0 transition-all duration-300",
              isOpen || isMobile ? "w-5 h-5" : "w-6 h-6"
            )}>
              <LogOut className={cn(
                "transition-all duration-300",
                isOpen || isMobile ? "h-5 w-5" : "h-6 w-6",
                "group-hover:scale-110"
              )} />
            </div>
            
            <span className={cn(
              'font-medium transition-all duration-300 ease-in-out',
              isOpen || isMobile 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-2 absolute pointer-events-none w-0 overflow-hidden"
            )}>
              Sign out
            </span>
          </button>
        </SidebarTooltip>
      </div>
    </div>
  );

  // Mobile sidebar with overlay
  if (isMobile) {
    if (!isMounted) {
      return null; // Prevent hydration mismatch
    }

    return (
      <>
        {/* Mobile trigger button */}
        <Button
          id="mobile-sidebar-trigger"
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 bg-background/80 backdrop-blur-sm border border-border/40 hover:bg-muted/80"
          onClick={handleToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside 
          id="mobile-sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden",
            "border-r border-border/40 shadow-xl",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {renderContent()}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 flex-col transition-all duration-300 ease-in-out",
      "border-r border-border/40 bg-background/95 backdrop-blur-sm",
      isOpen ? "w-64" : "w-16"
    )}>
      {renderContent()}
    </aside>
  );
}