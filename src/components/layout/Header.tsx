'use client';

import { UserNav } from '@/components/layout/UserNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { studentNavItems, counselorNavItems } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/layout/AppLogo';
import { useState, useEffect } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navItems = user?.role === 'student' ? studentNavItems : counselorNavItems;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mouse position for subtle gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 flex items-center gap-4 border-b transition-all duration-500 ease-out px-4 md:px-6",
        "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        isScrolled 
          ? "h-12 border-border/60 shadow-lg shadow-background/20" 
          : "h-14 border-border/20"
      )}
      style={{
        background: isScrolled 
          ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary)/0.03), transparent 40%)`
          : undefined
      }}
    >
      {/* Animated border gradient */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-1000 ease-out",
          isScrolled ? "w-full opacity-100" : "w-0 opacity-0"
        )}
      />

      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="group relative overflow-hidden hover:bg-primary/5 hover:scale-105 transition-all duration-300"
            >
              {/* Animated background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <Menu className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 relative z-10" />
              <span className="sr-only">Toggle navigation menu</span>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-md bg-primary/20 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 flex flex-col w-72 border-r-0 shadow-2xl"
          >
            <div className="flex h-full flex-col bg-gradient-to-b from-background via-background to-background/95 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%)] pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-border/40 relative z-10 backdrop-blur-sm">
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <AppLogo />
                </div>
                
                {/* Role indicator with animation */}
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary capitalize">
                    {user?.role || 'student'}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 relative z-10">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.disabled ? '#' : item.href}
                      className={cn(
                        "group relative w-full flex items-center p-3 gap-3 transition-all duration-300 ease-out",
                        "rounded-xl text-sm font-medium select-none overflow-hidden",
                        "transform hover:translate-x-1 hover:scale-[1.02]",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-lg shadow-primary/10 border border-primary/20"
                          : "text-muted-foreground hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:text-foreground hover:shadow-md",
                        item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent hover:transform-none",
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                      aria-disabled={item.disabled}
                      onClick={(e) => {
                        if (item.disabled) e.preventDefault();
                        else setIsOpen(false);
                      }}
                    >
                      {/* Animated background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="flex items-center justify-center shrink-0 w-5 h-5 relative z-10">
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                          isActive && "drop-shadow-sm animate-pulse"
                        )} />
                      </div>
                      
                      <span className="font-medium relative z-10 transition-all duration-300">
                        {item.title}
                      </span>
                      
                      {/* Active indicator with animation */}
                      {isActive && (
                        <div className="absolute right-2 w-2 h-2 bg-primary rounded-full relative z-10 animate-pulse">
                          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                        </div>
                      )}
                      
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                    </Link>
                  );
                })}
              </nav>

              {/* Logout section with enhanced styling */}
              <div className="border-t border-border/40 px-3 py-4 relative z-10 backdrop-blur-sm">
                <button
                  onClick={handleLogout}
                  className="group relative w-full flex items-center p-3 gap-3 transition-all duration-300 ease-out rounded-xl text-sm font-medium text-muted-foreground hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:text-destructive hover:shadow-lg hover:shadow-destructive/10 hover:translate-x-1 hover:scale-[1.02] overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-center justify-center shrink-0 w-5 h-5 relative z-10">
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-all duration-300 group-hover:-rotate-12" />
                  </div>
                  
                  <span className="font-medium relative z-10">
                    Sign out
                  </span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop logo - visible only on desktop */}
      <div className="hidden md:flex items-center">
        <div className="transform hover:scale-105 transition-all duration-300">
          <AppLogo />
        </div>
      </div>

      {/* Center section - Breadcrumb and current page indicator */}
      <div className="hidden md:flex items-center flex-1 justify-center">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/50 rounded-full border border-border/40 backdrop-blur-sm">
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            {navItems.find(item => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return isActive;
            })?.title || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right section with search and user nav */}
      <div className="flex items-center gap-3">
        {/* Quick search - desktop only */}
        <div className="hidden md:flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="group relative overflow-hidden bg-muted/30 hover:bg-muted/60 border border-border/40 px-3 py-1.5 h-8 text-xs transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-muted-foreground group-hover:text-foreground">
              ⌘K Search
            </span>
          </Button>
        </div>

        {/* Notifications indicator */}
        <div className="hidden md:flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="group relative overflow-hidden hover:bg-primary/5 hover:scale-105 transition-all duration-300 h-8 w-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-2 h-2 bg-primary rounded-full" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-[8px] text-destructive-foreground font-bold">3</span>
              </div>
            </div>
          </Button>
        </div>

        {/* User nav with enhanced styling */}
        <div className="transform hover:scale-105 transition-all duration-300">
          <UserNav />
        </div>
      </div>
      
      {/* Floating particles effect (subtle) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute w-1 h-1 bg-primary/20 rounded-full transition-all duration-1000",
          isScrolled ? "animate-pulse" : "opacity-0"
        )} style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
        <div className={cn(
          "absolute w-1 h-1 bg-primary/20 rounded-full transition-all duration-1000",
          isScrolled ? "animate-pulse" : "opacity-0"
        )} style={{ top: '60%', right: '15%', animationDelay: '0.5s' }} />
        <div className={cn(
          "absolute w-0.5 h-0.5 bg-primary/30 rounded-full transition-all duration-1000",
          isScrolled ? "animate-pulse" : "opacity-0"
        )} style={{ top: '40%', left: '70%', animationDelay: '1s' }} />
      </div>
    </header>
  );
}