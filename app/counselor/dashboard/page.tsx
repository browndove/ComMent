
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
    <Card className="shadow-sm hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}</div>
        </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
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
    return <Card className="bg-destructive/10 border-destructive text-center p-8">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
      <h3 className="text-xl font-bold text-destructive-foreground">Dashboard Error</h3>
      <p className="text-destructive-foreground/90">{error}</p>
      <Button variant="destructive" onClick={fetchData} className="mt-4">Try Again</Button>
    </Card>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Here&apos;s a snapshot of your counseling activities.</p>
        </div>
        <Button asChild>
          <Link href="/counselor/appointments">
            <Calendar className="mr-2 h-4 w-4" /> Manage All Appointments
          </Link>
        </Button>
      </div>

      {/* Schedule Calendar */}
      <ScheduleCalendar appointments={appointments} />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Students" 
          value={assignedStudents.length} 
          icon={Users} 
        />
        <StatCard title="Upcoming Sessions" value={upcomingSessions.length} icon={CalendarCheck} />
        <StatCard title="Pending Requests" value={pendingAppointments.length} icon={AlertTriangle} />
        <StatCard title="Notes to Complete" value={notesNeededCount} icon={MessageCircle} />
      </div>

      {/* Bento Grid */}
      <div className="grid auto-rows-[22rem] grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Session Analytics Chart */}
        <Card className="lg:col-span-2 flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle>Session Analytics</CardTitle>
            <CardDescription>A look at your recent session activity.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 flex-1">
            <AppointmentsChart data={appointments} />
          </CardContent>
        </Card>
        
        {/* Next Session Reminder */}
        {nextSession ? (
          <Card className="flex flex-col shadow-lg">
            <CardHeader>
              <CardTitle>Next Session</CardTitle>
              <CardDescription>Your next confirmed appointment.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center text-center">
              <Avatar className="w-20 h-20 mb-4 border-4 border-primary/20">
                 <AvatarImage src={nextSession.studentAvatarUrl} alt={nextSession.studentName} />
                 <AvatarFallback className="text-3xl">{nextSession.studentName.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
              </Avatar>
              <p className="text-xl font-semibold">{nextSession.studentName}</p>
              <div className="text-md text-muted-foreground flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" /> {format(parseISO(nextSession.date), 'EEE, MMM dd')}
              </div>
              <div className="text-md text-muted-foreground flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4" /> {nextSession.time}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild size="lg">
                <Link href={`/session/${nextSession.id}/video`}>Start Meeting</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center shadow-lg">
            <CardHeader><CardTitle>No Upcoming Sessions</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              <CalendarCheck className="h-16 w-16 mx-auto mb-4 text-primary"/>
              <p>Your schedule is clear. Enjoy the break!</p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                    <Link href="/counselor/appointments">View Full Schedule</Link>
                </Button>
            </CardFooter>
          </Card>
        )}

        {/* Assigned Students List */}
        <Card className="lg:col-span-3 flex flex-col shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div >
                <CardTitle>Assigned Students</CardTitle>
                <CardDescription>An overview of students you are currently assisting.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild><Link href="/counselor/students"><Users className="mr-2 h-4 w-4"/>View All Students</Link></Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {assignedStudents.slice(0, 4).map(student => (
                <div key={student.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatarUrl} alt={student.fullName} data-ai-hint={student.aiHint} />
                    <AvatarFallback className="text-lg">{student.fullName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{student.fullName}</p>
                    <p className="text-sm text-muted-foreground">ID: {student.universityId}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                     <Link href={`/counselor/students/${student.id}/profile`}>View Profile <ArrowRight className="w-4 h-4 ml-2"/></Link>
                  </Button>
                </div>
              ))}
              {assignedStudents.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No students assigned yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
