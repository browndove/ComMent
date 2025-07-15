'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Sidebar context
interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// SidebarProvider component
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};

// SidebarRail component with Japanese styling
const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        'fixed inset-y-0 left-0 z-30 h-full transition-all duration-500 ease-out',
        // Japanese-inspired background with subtle gradient
        'bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
        // Traditional Japanese paper texture effect
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] before:bg-[length:8px_8px]',
        // Subtle border with traditional color
        'border-r border-slate-200/60 dark:border-slate-700/60',
        // Soft shadow for depth
        'shadow-[4px_0_20px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.2)]',
        isOpen ? 'w-72' : 'w-20',
        className
      )}
      {...props}
    />
  );
});
SidebarRail.displayName = 'SidebarRail';

// SidebarInset component with smooth transitions
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500 ease-out flex flex-col h-screen',
        // Smooth margin transition for bento grid layout
        isOpen ? 'md:pl-72' : 'md:pl-20',
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';

// Japanese-styled tooltip wrapper
export interface SidebarTooltipProps {
  children: React.ReactNode;
  label: string;
}

export const SidebarTooltip: React.FC<SidebarTooltipProps> = ({
  children,
  label,
}) => {
  const { isOpen } = useSidebar();

  if (isOpen) {
    return <>{children}</>;
  }

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent 
        side="right" 
        className={cn(
          "bg-slate-800 text-slate-50 border border-slate-700",
          // Japanese-inspired rounded corners
          "rounded-xl px-3 py-2",
          // Subtle shadow for floating effect
          "shadow-lg shadow-slate-900/20",
          // Smooth animation
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        <p className="text-sm font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export { SidebarRail, SidebarInset };