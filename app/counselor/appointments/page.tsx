
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  PlusCircle,
  Loader2,
  Clock,
  NotebookPen,
  FileText,
  Filter,
  Search,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCounselorAppointments, updateAppointmentStatus } from '@/lib/actions';
import type { Appointment } from '@/components/dashboard/AppointmentCard';

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = "primary", loading = false }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    loading?: boolean;
}) => {
  const colorClasses: { [key: string]: string } = {
    primary: 'bg-primary',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : value}
        </div>
      </CardContent>
    </Card>
  );
};


// Enhanced Appointment Card Component
const AppointmentCard = ({ appointment, onUpdateStatus }: { appointment: Appointment; onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled') => void }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const StatusIcon = useMemo(() => {
    switch (appointment.status.toLowerCase()) {
      case 'confirmed': return CheckCircle;
      case 'pending': return AlertCircle;
      case 'cancelled': return XCircle;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  }, [appointment.status]);

  const handleUpdate = async (status: 'confirmed' | 'cancelled') => {
      setIsUpdating(true);
      await onUpdateStatus(appointment.id, status);
      setIsUpdating(false);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={appointment.studentAvatarUrl} alt={appointment.studentName} />
              <AvatarFallback>{appointment.studentName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-card-foreground">{appointment.studentName}</h4>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
              <DropdownMenuItem><Edit3 className="w-4 h-4 mr-2" />Edit Notes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdate('cancelled')} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>{new Date(appointment.date).toLocaleDateString()}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /><span>{appointment.time}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /><span>Online</span></div>
           <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <Badge variant={getStatusVariant(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>
        </div>
        {appointment.reason && (
          <div className="p-3 bg-muted rounded-lg"><p className="text-sm text-muted-foreground italic">&quot;{appointment.reason}&quot;</p></div>
        )}
      </CardContent>
       {appointment.status.toLowerCase() === 'pending' && (
          <CardFooter className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => handleUpdate('confirmed')} className="flex-1" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleUpdate('cancelled')} className="flex-1" disabled={isUpdating}>
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </CardFooter>
        )}
    </Card>
  );
};


// Quick Actions Component
const QuickActions = () => (
  <Card className="bg-gradient-to-r from-primary/10 to-accent/10 lg:col-span-1">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Activity className="h-5 w-5 text-primary" />
        Quick Actions
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-3">
      <Button variant="outline" className="justify-start"><PlusCircle className="h-4 w-4 mr-2" />New Session</Button>
      <Button variant="outline" className="justify-start"><NotebookPen className="h-4 w-4 mr-2" />Add Notes</Button>
      <Button variant="outline" className="justify-start"><Calendar className="h-4 w-4 mr-2" />View Calendar</Button>
      <Button variant="outline" className="justify-start"><Users className="h-4 w-4 mr-2" />Student List</Button>
    </CardContent>
  </Card>
);

// Main Component
export default function CounselorAppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getCounselorAppointments(user.uid);
      if (result.error) throw new Error(result.error);
      setAllAppointments(result.data as Appointment[] || []);
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Failed to load appointments", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  
  const handleUpdateStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    const originalAppointments = [...allAppointments];
    // Optimistic update
    setAllAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : a));

    const result = await updateAppointmentStatus(id, newStatus);
    if (!result.success) {
        toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
        setAllAppointments(originalAppointments); // Revert on failure
    } else {
        toast({ title: 'Success', description: `Appointment has been ${newStatus}.`});
    }
  };
  
  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(a => {
        const statusMatch = filter === 'All' || a.status.toLowerCase() === filter.toLowerCase() || (filter === 'History' && ['completed', 'cancelled'].includes(a.status.toLowerCase()));
        const searchMatch = !searchTerm || a.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
    });
  }, [allAppointments, filter, searchTerm]);
  
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    return {
      todaysAppointments: allAppointments.filter(a => a.date === todayStr && a.status.toLowerCase() === 'confirmed').length,
      pendingAppointments: allAppointments.filter(a => a.status.toLowerCase() === 'pending').length,
      confirmedAppointments: allAppointments.filter(a => a.status.toLowerCase() === 'confirmed').length,
      needsNotesCount: allAppointments.filter(a => a.status.toLowerCase() === 'completed' && !(a as any).notesAvailable).length,
    };
  }, [allAppointments]);
  
  const renderSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></CardHeader>
          <CardContent className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent>
          <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
        </Card>
      ))}
    </div>
  );
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your student sessions and track your counseling activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchAppointments} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button size="lg"><PlusCircle className="h-5 w-5 mr-2" />New Session Note</Button>
        </div>
      </div>
      
      {/* Error State */}
      {error && (
        <Card className="bg-destructive/10 border-destructive"><CardContent className="p-4"><div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /><span className="font-medium">Error: {error}</span></div></CardContent></Card>
      )}
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Today's Sessions" value={stats.todaysAppointments} icon={Clock} color="primary" loading={loading} />
        <StatsCard title="Pending Requests" value={stats.pendingAppointments} icon={AlertTriangle} color="yellow" loading={loading} />
        <StatsCard title="Confirmed Sessions" value={stats.confirmedAppointments} icon={CalendarCheck} color="green" loading={loading} />
        <StatsCard title="Needs Notes" value={stats.needsNotesCount} icon={NotebookPen} color="purple" loading={loading} />
        <QuickActions />
      </div>
      
      {/* Appointments Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div><CardTitle>All Appointments</CardTitle><CardDescription>Filter and manage your scheduled sessions</CardDescription></div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full sm:w-64" /></div>
              <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-gray-400" />
                {(['All', 'Pending', 'Confirmed', 'History']).map(f => (
                  <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="relative">
                    {f}
                    {f === 'Pending' && stats.pendingAppointments > 0 && (<Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 px-1.5">{stats.pendingAppointments}</Badge>)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? renderSkeleton() : filteredAppointments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredAppointments.map(appointment => (<AppointmentCard key={appointment.id} appointment={appointment} onUpdateStatus={handleUpdateStatus} />))}
            </div>
          ) : (
            <div className="text-center py-12"><div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"><FileText className="h-8 w-8 text-muted-foreground" /></div><h3 className="text-lg font-semibold text-foreground mb-2">No appointments found</h3><p className="text-muted-foreground max-w-sm mx-auto">There are no appointments matching your current filter criteria.</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    