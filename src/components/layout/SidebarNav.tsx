'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar, SidebarTooltip } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/AppLogo';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

  const handleToggle = () => setIsOpen(!isOpen);

  const renderContent = () => (
    <div className="flex h-full flex-col relative">
      {/* Header section with Japanese-inspired design */}
      <div
        className={cn(
          "flex items-center h-20 px-6 relative",
          // Subtle bottom border with traditional styling
          "after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px",
          "after:bg-gradient-to-r after:from-transparent after:via-slate-300/60 after:to-transparent",
          "dark:after:via-slate-600/60",
          isOpen ? "justify-between" : "justify-center"
        )}
      >
        <div className={cn(
          "transition-all duration-300 ease-out",
          !isOpen && "opacity-0 scale-95"
        )}>
          <AppLogo />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "hidden md:flex transition-all duration-300 ease-out",
            // Japanese-inspired button styling
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            "rounded-xl h-10 w-10",
            // Subtle shadow on hover
            "hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50",
            isOpen ? "translate-x-0" : "rotate-180"
          )}
          onClick={handleToggle}
        >
          {isOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation section */}
      <nav className={cn(
        "flex-1 overflow-y-auto px-4 py-6 space-y-2",
        // Custom scrollbar for Japanese aesthetic
        "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent",
        "dark:scrollbar-thumb-slate-600"
      )}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <SidebarTooltip key={item.href} label={item.title}>
              <Link
                href={item.disabled ? '#' : item.href}
                className={cn(
                  // Base styling with Japanese-inspired design
                  "group relative w-full flex items-center transition-all duration-300 ease-out",
                  "px-4 py-3 rounded-2xl text-sm font-medium",
                  // Staggered animation delay for smooth entrance
                  "animate-in fade-in-0 slide-in-from-left-2",
                  // Active state with elegant background
                  isActive ? [
                    "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900",
                    "dark:from-indigo-900/20 dark:to-purple-900/20 dark:text-indigo-100",
                    "shadow-sm shadow-indigo-100/50 dark:shadow-indigo-900/20",
                    // Subtle left border accent
                    "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1",
                    "before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500",
                    "before:rounded-r-full"
                  ] : [
                    "text-slate-600 dark:text-slate-400",
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    "hover:text-slate-900 dark:hover:text-slate-100"
                  ],
                  // Disabled state
                  item.disabled && "cursor-not-allowed opacity-50",
                  // Smooth hover effects
                  "hover:translate-x-1 hover:shadow-md hover:shadow-slate-200/20",
                  "dark:hover:shadow-slate-900/20"
                )}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : undefined}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Icon with smooth transitions */}
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300 ease-out",
                  "group-hover:scale-110",
                  isOpen ? "mr-4" : "mr-0",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-current"
                )} />
                
                {/* Text with smooth reveal */}
                <span className={cn(
                  'truncate transition-all duration-300 ease-out',
                  !isOpen && "sr-only opacity-0 scale-95",
                  isOpen && "opacity-100 scale-100"
                )}>
                  {item.title}
                </span>
                
                {/* Label with Japanese-inspired styling */}
                {item.label && isOpen && (
                  <span className={cn(
                    "ml-auto px-2 py-1 text-xs font-medium rounded-full",
                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    "transition-all duration-300 ease-out"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            </SidebarTooltip>
          );
        })}
      </nav>

      {/* Bottom accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent dark:via-slate-600/60 mx-4" />
    </div>
  );

  if (isMobile) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl m-4 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
        {renderContent()}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden h-full flex-col transition-all duration-500 ease-out md:flex',
        // Japanese-inspired background with subtle texture
        'bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
        // Traditional paper texture effect
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] before:bg-[length:8px_8px]',
        // Elegant border and shadow
        'border-r border-slate-200/60 dark:border-slate-700/60',
        'shadow-[4px_0_20px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.2)]',
        isOpen ? 'w-72' : 'w-20'
      )}
    >
      {renderContent()}
    </aside>
  );
}