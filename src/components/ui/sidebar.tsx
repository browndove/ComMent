
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

// SidebarRail component with styling
const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        'hidden md:block fixed inset-y-0 left-0 z-30 h-full transition-all duration-300 ease-in-out',
        'bg-card border-r',
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,theme(colors.primary/0.03)_1px,transparent_1px)] before:bg-[length:16px_16px]',
        isOpen ? 'w-60' : 'w-20',
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
        'transition-all duration-300 ease-in-out flex flex-col h-screen',
        isOpen ? 'md:pl-60' : 'md:pl-20',
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';

// Tooltip wrapper
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
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent 
        side="right" 
        className="bg-background border px-3 py-1.5"
      >
        <p className="text-sm font-semibold">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export { SidebarRail, SidebarInset };
