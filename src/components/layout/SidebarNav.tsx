
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar, SidebarTooltip } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, LogOut } from 'lucide-react';
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

export function SidebarNav({ navItems, isMobile = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();

  const handleToggle = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const renderContent = () => (
    <div className="flex h-full flex-col">
       <div
        className={cn(
          "flex items-center border-b border-border/60 h-16",
          isOpen || isMobile ? "px-4 justify-between" : "px-2 justify-center"
        )}
      >
        <div className={cn("transition-opacity duration-300", !isOpen && !isMobile && "opacity-0 pointer-events-none")}>
           <AppLogo />
        </div>
       
        {!isMobile && (
           <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleToggle}
          >
            <ChevronsLeft className={cn("h-5 w-5 transition-transform duration-500", !isOpen && "rotate-180")} />
          </Button>
        )}
      </div>

      <nav className={cn(
        "flex-1 overflow-y-auto px-4 py-6 space-y-1.5",
        "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
      )}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <SidebarTooltip key={item.href} label={item.title}>
              <Link
                href={item.disabled ? '#' : item.href}
                className={cn(
                  "group relative w-full flex items-center transition-all duration-200",
                  "px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  item.disabled && "cursor-not-allowed opacity-50",
                )}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  "group-hover:scale-110",
                   (isOpen || isMobile) ? "mr-3" : "mr-0",
                )} />
                <span className={cn('truncate transition-opacity', !(isOpen || isMobile) && "opacity-0 sr-only")}>
                  {item.title}
                </span>
              </Link>
            </SidebarTooltip>
          );
        })}
      </nav>

      <div className="px-4 py-4 mt-auto border-t border-border/60">
        <SidebarTooltip label="Logout">
          <button
            onClick={handleLogout}
            className={cn(
              "group relative w-full flex items-center transition-colors",
              "px-3 py-2.5 rounded-lg text-sm font-medium",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              !(isOpen || isMobile) && "justify-center"
            )}
          >
            <LogOut className={cn(
              "h-5 w-5 transition-all duration-200",
              (isOpen || isMobile) ? "mr-3" : "mr-0"
            )} />
            <span className={cn('truncate transition-opacity', !(isOpen || isMobile) && "opacity-0 sr-only")}>
              Logout
            </span>
          </button>
        </SidebarTooltip>
      </div>
    </div>
  );

  // If mobile, render content directly without the desktop <aside> wrapper.
  if (isMobile) {
    return renderContent();
  }

  // For desktop, wrap in the <aside> tag which is controlled by SidebarRail
  return (
     <aside className="fixed inset-y-0 left-0 z-40 h-full flex-col">
      {renderContent()}
    </aside>
  );
}
