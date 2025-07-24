
'use client';


import { SidebarNav } from "../../src/components/layout/SidebarNav";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { studentNavItems } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function StudentLayout({
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

  // Ensure the user is a student before rendering the layout
  if (user.role !== 'student') {
      // Option 1: Redirect to their correct dashboard
      if (user.role === 'counselor') {
          router.replace('/counselor/dashboard');
          return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
      }
      // Option 2: Redirect to login if role is unexpected
      router.replace('/login');
      return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="hidden md:block">
        <SidebarNav navItems={studentNavItems} userRole="student" />
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
