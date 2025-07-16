
'use client';

import { Header } from "@/components/layout/Header";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { counselorNavItems } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Ensure the user is a counselor before rendering the layout
  if (user.role !== 'counselor') {
      // Redirect students to their dashboard
      if (user.role === 'student') {
          router.replace('/student/dashboard');
          return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
      }
      // Redirect any other case to login
      router.replace('/login');
      return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="hidden md:block">
        <SidebarNav navItems={counselorNavItems} userRole="counselor" />
      </div>
      <SidebarRail />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
