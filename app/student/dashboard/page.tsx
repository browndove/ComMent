
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, Bot, BookOpen, UserCircle, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// This would come from a real data fetch in a real app
const upcomingAppointment = { 
  id: '1', 
  counselor: 'Dr. Emily Carter', 
  date: '2024-08-15', 
  time: '10:00 AM', 
  type: 'Video Call' 
};

export default function StudentDashboardPage() {
  const { user } = useAuth(); // Get user from AuthContext

  const FeatureCard = ({ title, description, href, icon: Icon, tag, bgColorClass, children }: {
    title: string,
    description?: string,
    href: string,
    icon: React.ElementType,
    tag?: string,
    bgColorClass?: string,
    children?: React.ReactNode
  }) => (
     <Card className={cn("group relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1", bgColorClass)}>
        <CardHeader>
            <div className="mb-4 flex justify-between items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                    <Icon className="h-6 w-6 text-white"/>
                </div>
                {tag && <Badge variant="secondary" className="bg-white/20 text-white border-0">{tag}</Badge>}
            </div>
            <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
            {description && <p className="text-white/80">{description}</p>}
            {children}
        </CardContent>
        <CardFooter>
             <Button asChild variant="secondary" className="mt-4 bg-white/90 text-primary hover:bg-white w-full">
                <Link href={href}>
                    {title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-8">
       {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.fullName?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Welcome back. Let&apos;s continue your wellness journey.</p>
        </div>
      </div>

       {/* Bento Grid */}
       <div className="grid auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-6">

        {/* Request Appointment Card */}
        <div className="md:col-span-2">
            <FeatureCard 
                title="Request an Appointment"
                description="Ready to talk? Schedule a confidential session with one of our professional counselors at a time that works for you."
                href="/student/appointments/request"
                icon={CalendarPlus}
                tag="Get Started"
                bgColorClass="bg-gradient-to-br from-primary to-green-800"
            />
        </div>

        {/* AI Assistant Card */}
        <div className="md:col-span-1">
             <FeatureCard 
                title="AI Assistant"
                description="Need quick answers or self-help tips? Ama, our AI assistant, is available 24/7."
                href="/student/ai-assistant"
                icon={Bot}
                tag="Always On"
                 bgColorClass="bg-gradient-to-br from-gray-700 to-gray-900"
            />
        </div>

        {/* Upcoming Appointment */}
        <div className="md:col-span-1">
             <FeatureCard 
                title="Upcoming Session"
                href="/student/sessions"
                icon={Calendar}
                bgColorClass="bg-gradient-to-br from-purple-500 to-indigo-700"
              >
                 <div className="text-white/80 h-full flex flex-col items-center justify-center text-center">
                    {upcomingAppointment ? (
                        <>
                         <p className="font-semibold text-lg">{upcomingAppointment.counselor}</p>
                         <p className="text-sm">{upcomingAppointment.date}</p>
                         <p className="text-sm">{upcomingAppointment.time} • {upcomingAppointment.type}</p>
                        </>
                    ) : (
                        <p>No upcoming appointments.</p>
                    )}
                 </div>
              </FeatureCard>
        </div>

        {/* Resources Card */}
        <div className="md:col-span-1">
             <FeatureCard 
                title="Resource Library"
                description="Explore articles, tools, and guides to support your mental wellness journey."
                href="/student/resources"
                icon={BookOpen}
                bgColorClass="bg-gradient-to-br from-teal-500 to-cyan-700"
            />
        </div>

        {/* Profile Card */}
        <div className="md:col-span-1">
            <FeatureCard 
                title="My Profile"
                description="Keep your contact details up to date for seamless communication."
                href="/student/profile"
                icon={UserCircle}
                bgColorClass="bg-gradient-to-br from-orange-500 to-rose-600"
            />
        </div>

       </div>
    </div>
  );
}
