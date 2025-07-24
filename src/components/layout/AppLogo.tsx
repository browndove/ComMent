import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ 
  className, 
  variant = 'default', 
  showTagline = false 
}: { 
  className?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'hero';
  showTagline?: boolean;
}) {
  const variants = {
    default: {
      container: "flex items-center gap-3",
      iconSize: "h-8 w-8",
      textSize: "text-lg font-semibold",
      taglineSize: "text-sm"
    },
    compact: {
      container: "flex items-center gap-2.5",
      iconSize: "h-7 w-7",
      textSize: "text-base font-medium",
      taglineSize: "text-xs"
    },
    minimal: {
      container: "flex items-center gap-2",
      iconSize: "h-6 w-6",
      textSize: "text-sm font-medium",
      taglineSize: "text-xs"
    },
    hero: {
      container: "flex items-center gap-4",
      iconSize: "h-12 w-12",
      textSize: "text-2xl font-bold",
      taglineSize: "text-base"
    }
  };

  const currentVariant = variants[variant];

  return (
    <Link 
      href="/" 
      className={cn(
        currentVariant.container,
        "transition-all duration-200 hover:opacity-80 group",
        className
      )}
    >
      {/* Clean Icon */}
      <div className="relative">
        <div className="p-2 bg-primary rounded-lg transition-all duration-200 group-hover:shadow-md">
          <GraduationCap className={cn(
            currentVariant.iconSize,
            "text-primary-foreground"
          )} />
        </div>
      </div>

      {/* Clean Text */}
      <div>
        <div className={cn(
          currentVariant.textSize,
          "text-foreground tracking-tight leading-tight"
        )}>
          <span className="block -mt-1">TechMind</span>
        </div>
        
        {showTagline && (
          <div className={cn(
            currentVariant.taglineSize,
            "text-muted-foreground"
          )}>
            Educational Platform
          </div>
        )}
      </div>
    </Link>
  );
}