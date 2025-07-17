'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  BarChart, Users, CalendarCheck, MessageCircle, Activity, AlertTriangle, 
  Settings, Loader2, Plus, Calendar, Clock, ArrowRight, BookOpen, NotebookPen
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getCounselorAppointments, getAssignedStudents } from '@/lib/actions';
import { useEffect, useState, useCallback } from 'react';
import type { Appointment } from "@/components/dashboard/AppointmentCard";
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AppointmentsChart } from '@/components/counselor/AppointmentsChart';
import { ScheduleCalendar } from '@/components/counselor/ScheduleCalendar';
import { cn } from '@/lib/utils';

type Student = {
  id: string;
  fullName: string;
  universityId: string;
  avatarUrl?: string;
  aiHint?: string;
};

export default function CounselorDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [appointmentsResult, studentsResult] = await Promise.all([
        getCounselorAppointments(user.uid),
        getAssignedStudents(user.uid)
      ]);

      if (appointmentsResult.error) throw new Error(appointmentsResult.error);
      if (studentsResult.error) throw new Error(studentsResult.error);

      setAppointments(appointmentsResult.data as Appointment[] || []);
      setAssignedStudents(studentsResult.data as Student[] || []);
    } catch (err: any) {
      setError(err.message);
      toast({ variant: 'destructive', title: "Failed to load dashboard", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const pendingAppointments = appointments.filter(a => a.status.toLowerCase() === 'pending');
  const upcomingSessions = appointments.filter(a => a.status.toLowerCase() === 'confirmed' && new Date(a.date) >= new Date());
  const nextSession = upcomingSessions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const notesNeededCount = appointments.filter(a => a.status.toLowerCase() === 'completed' && !(a as any).notesAvailable).length;

  const StatCard = ({ title, value, icon: Icon }: { 
    title: string, 
    value: string | number, 
    icon: React.ElementType
  }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold">
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 auto-rows-fr">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-42 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="bg-destructive/10 border-destructive text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-destructive-foreground">Dashboard Error</h3>
          <p className="text-destructive-foreground/90 mb-4">{error}</p>
          <Button variant="destructive" onClick={fetchData} className="mt-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Here's a snapshot of your counseling activities</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/counselor/appointments">
            <Calendar className="mr-2 h-4 w-4" /> 
            <span className="hidden sm:inline">Manage All Appointments</span>
            <span className="inline sm:hidden">Appointments</span>
          </Link>
        </Button>
      </div>

      {/* Schedule Calendar - Mobile optimized */}
      <div className="rounded-xl border bg-card shadow-sm">
        <ScheduleCalendar 
          appointments={appointments} 
          isMobile={isMobile}
        />
      </div>

      {/* Stats Grid - Responsive layout */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
        <StatCard 
          title="Total Students" 
          value={assignedStudents.length} 
          icon={Users} 
        />
        <StatCard 
          title="Upcoming" 
          value={upcomingSessions.length} 
          icon={CalendarCheck} 
        />
        <StatCard 
          title={isMobile ? "Pending" : "Pending Requests"} 
          value={pendingAppointments.length} 
          icon={AlertTriangle} 
        />
        <StatCard 
          title={isMobile ? "Notes" : "Notes to Complete"} 
          value={notesNeededCount} 
          icon={MessageCircle} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 auto-rows-fr grid-cols-1 lg:grid-cols-3">
        {/* Session Analytics Chart */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Session Analytics</CardTitle>
            <CardDescription>Your recent counseling activity</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AppointmentsChart data={appointments} isMobile={isMobile} />
          </CardContent>
        </Card>
        
        {/* Next Session Reminder */}
        <Card className="flex flex-col shadow-md">
          {nextSession ? (
            <>
              <CardHeader>
                <CardTitle>Next Session</CardTitle>
                <CardDescription>Your upcoming appointment</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-primary/20">
                  <AvatarImage src={nextSession.studentAvatarUrl} alt={nextSession.studentName} />
                  <AvatarFallback className="text-xl md:text-2xl">
                    {nextSession.studentName.split(" ").map(n=>n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg md:text-xl font-semibold">{nextSession.studentName}</p>
                  <div className="flex flex-col items-center mt-2 space-y-1">
                    <div className="flex items-center text-sm md:text-base text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" /> 
                      {format(parseISO(nextSession.date), 'EEE, MMM dd')}
                    </div>
                    <div className="flex items-center text-sm md:text-base text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" /> 
                      {nextSession.time}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild size={isMobile ? "default" : "lg"}>
                  <Link href={`/session/${nextSession.id}/video`}>
                    {isMobile ? 'Start' : 'Start Meeting'}
                  </Link>
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>No Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <CalendarCheck className="h-12 w-12 mx-auto text-primary" />
                <p className="text-muted-foreground">Your schedule is clear</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/counselor/appointments">
                    {isMobile ? 'Schedule' : 'View Full Schedule'}
                  </Link>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        {/* Assigned Students List */}
        <Card className="lg:col-span-3 shadow-md">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Assigned Students</CardTitle>
              <CardDescription>Students you're currently assisting</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
              <Link href="/counselor/students">
                <Users className="mr-2 h-4 w-4" />
                {isMobile ? 'Students' : 'View All Students'}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {assignedStudents.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {assignedStudents.slice(0, isMobile ? 2 : 4).map(student => (
                  <div 
                    key={student.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                      <AvatarFallback className="text-sm">
                        {student.fullName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">ID: {student.universityId}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="shrink-0">
                      <Link href={`/counselor/students/${student.id}/profile`}>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}