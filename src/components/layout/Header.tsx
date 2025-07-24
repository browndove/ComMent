'use client';

import { UserNav } from '@/components/layout/UserNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { studentNavItems, counselorNavItems } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/layout/AppLogo';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = user?.role === 'student' ? studentNavItems : counselorNavItems;

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col w-72">
            <div className="flex h-full flex-col bg-background">
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-border/40">
                <AppLogo />
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.disabled ? '#' : item.href}
                      className={cn(
                        "group relative w-full flex items-center p-3 gap-3 transition-all duration-300 ease-in-out",
                        "rounded-xl text-sm font-medium select-none",
                        isActive
                          ? "bg-primary/15 text-primary shadow-sm border border-primary/20"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:shadow-sm",
                        item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
                        !isActive && "hover:translate-x-0.5"
                      )}
                      aria-disabled={item.disabled}
                      onClick={(e) => {
                        if (item.disabled) e.preventDefault();
                        else setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center shrink-0 w-5 h-5">
                        <item.icon className="h-5 w-5 group-hover:scale-110 transition-all duration-300" />
                      </div>
                      
                      <span className="font-medium">
                        {item.title}
                      </span>
                      
                      {isActive && (
                        <div className="absolute right-2 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User section & Logout */}
              <div className="border-t border-border/40 px-3 py-4">
                {/* User role badge */}
                <div className="mb-3 px-3 py-2 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {user?.role || 'student'}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="group relative w-full flex items-center p-3 gap-3 transition-all duration-300 ease-in-out rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:shadow-sm hover:translate-x-0.5"
                >
                  <div className="flex items-center justify-center shrink-0 w-5 h-5">
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  
                  <span className="font-medium">
                    Sign out
                  </span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        <UserNav />
      </div>
    </header>
  );
}