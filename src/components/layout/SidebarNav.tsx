'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar, SidebarTooltip } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  isMobile?: boolean;
}

export function SidebarNav({ navItems, userRole, isMobile = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();

  const handleToggle = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const sidebarWidth = isOpen ? 'w-64' : 'w-16';
  const mobileWidth = isMobile ? 'w-64' : sidebarWidth;

  const renderContent = () => (
    <div className={cn(
      "flex h-full flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-r border-border/40 transition-all duration-300 ease-in-out",
      mobileWidth
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-border/60 h-16 px-4",
        "bg-muted/20 backdrop-blur-sm",
        isOpen || isMobile ? "justify-between" : "justify-center"
      )}>
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen || isMobile ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}>
          <AppLogo />
        </div>
       
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-md transition-all duration-200",
              "hover:bg-muted/80 hover:scale-105 active:scale-95",
              "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronsLeft className="h-4 w-4" />
            ) : (
              <ChevronsRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 space-y-1",
        "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent",
        isOpen || isMobile ? "px-3" : "px-2"
      )}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          const navLink = (
            <Link
              href={item.disabled ? '#' : item.href}
              className={cn(
                "group relative w-full flex items-center transition-all duration-200",
                "rounded-lg text-sm font-medium overflow-hidden",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                isOpen || isMobile ? "p-3 gap-3" : "p-2 justify-center",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:shadow-sm",
                item.disabled && "cursor-not-allowed opacity-50",
                !isActive && "hover:scale-[1.02] active:scale-[0.98]"
              )}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}
              
              {/* Icon */}
              <div className={cn(
                "flex items-center justify-center transition-all duration-200",
                isOpen || isMobile ? "w-5 h-5" : "w-5 h-5",
                "group-hover:scale-110"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-200 shrink-0",
                  isActive && "text-primary"
                )} />
              </div>
              
              {/* Label */}
              <span className={cn(
                "truncate transition-all duration-300 ease-in-out font-medium",
                isOpen || isMobile 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-2 sr-only w-0"
              )}>
                {item.title}
              </span>
              
              {/* Badge/Label */}
              {item.label && (isOpen || isMobile) && (
                <span className={cn(
                  "ml-auto text-xs px-2 py-1 rounded-full",
                  "bg-primary/10 text-primary border border-primary/20",
                  "transition-all duration-300"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );

          return (
            <div key={item.href} className="relative">
              {!(isOpen || isMobile) ? (
                <SidebarTooltip label={item.title}>
                  {navLink}
                </SidebarTooltip>
              ) : (
                navLink
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-border/60 bg-muted/10 backdrop-blur-sm",
        "transition-all duration-300",
        isOpen || isMobile ? "px-3 py-4" : "px-2 py-4"
      )}>
        <div className="relative">
          {!(isOpen || isMobile) ? (
            <SidebarTooltip label="Logout">
              <button
                onClick={handleLogout}
                className={cn(
                  "group relative w-full flex items-center transition-all duration-200",
                  "p-2 rounded-lg text-sm font-medium justify-center",
                  "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  "hover:scale-105 active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-destructive/50"
                )}
              >
                <LogOut className="h-5 w-5 transition-all duration-200" />
              </button>
            </SidebarTooltip>
          ) : (
            <button
              onClick={handleLogout}
              className={cn(
                "group relative w-full flex items-center transition-all duration-200",
                "p-3 rounded-lg text-sm font-medium gap-3",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                "hover:scale-[1.02] active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-destructive/50"
              )}
            >
              <LogOut className="h-5 w-5 transition-all duration-200 shrink-0" />
              <span className="truncate font-medium">Logout</span>
            </button>
          )}
        </div>
        
        {/* User role indicator */}
        {(isOpen || isMobile) && (
          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={cn(
                "w-2 h-2 rounded-full",
                userRole === 'student' ? "bg-blue-500" : "bg-green-500"
              )} />
              <span className="capitalize font-medium">{userRole}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="h-full">
        {renderContent()}
      </div>
    );
  }

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 h-full transition-all duration-300 ease-in-out",
      "shadow-lg shadow-black/5",
      sidebarWidth
    )}>
      {renderContent()}
    </aside>
  );
}