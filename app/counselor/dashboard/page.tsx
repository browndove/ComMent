'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  BarChart, Users, CalendarCheck, MessageCircle, Activity, AlertTriangle, 
  Settings, Loader2, Plus, Calendar, Clock, ArrowRight, BookOpen, NotebookPen,
  Phone, Mail, Search, Filter, MoreHorizontal, Video, User, Home, FileText,
  Target, Building, TrendingUp, ChevronDown, Bell, Grid3X3, Mic
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getCounselorAppointments, getAssignedStudents } from '@/lib/actions';
import { useEffect, useState, useCallback } from 'react';
import type { Appointment } from "@/components/dashboard/AppointmentCard";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AppointmentsChart } from '@/components/counselor/AppointmentsChart';
import { ScheduleCalendar } from '@/components/counselor/ScheduleCalendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type Student = {
  id: string;
  fullName: string;
  universityId: string;
  avatarUrl?: string;
  aiHint?: string;
  status?: 'Active' | 'Pending' | 'Closed';
  type?: string;
  nextAppointment?: string;
  lastContact?: string;
};

type CalendarAppointment = {
  id: string;
  studentName: string;
  studentAvatar?: string;
  time: string;
  type: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  duration?: string;
};

export default function CounselorDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('Week');

  // Mock calendar appointments for demonstration
  const [calendarAppointments] = useState<CalendarAppointment[]>([
    {
      id: '1',
      studentName: 'James Anderson',
      studentAvatar: '',
      time: '8:30-9:30 PM',
      type: '2BR Apartment Viewing',
      status: 'Pending',
      duration: '1h'
    },
    {
      id: '2',
      studentName: 'Robert White',
      time: '10:00-11:20 PM',
      type: 'Townhouse Visit',
      status: 'Confirmed',
      duration: '1h 20m'
    },
    {
      id: '3',
      studentName: 'Emily Johnson',
      time: '9:50-10:30 PM',
      type: 'Penthouse Tour',
      status: 'Pending',
      duration: '40m'
    }
  ]);

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

      // Add mock data for better styling demonstration
      const studentsWithStatus = (studentsResult.data as Student[] || []).map((student, index) => ({
        ...student,
        status: (['Active', 'Pending', 'Closed'] as const)[index % 3],
        type: ['Academic Support', 'Career Guidance', 'Personal Counseling'][index % 3],
        nextAppointment: ['Su 12:03 2:30 pm', 'Mo 14:30 3:00 pm', 'Tu 09:15 1:45 pm'][index % 3],
        lastContact: ['2 days ago', '1 week ago', '3 days ago'][index % 3]
      }));

      setAppointments(appointmentsResult.data as Appointment[] || []);
      setAssignedStudents(studentsWithStatus);
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'closed': case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredStudents = assignedStudents.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.universityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">COUNSELING</span>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search" 
                className="pl-10 w-full sm:w-80 border-gray-200"
              />
            </div>
            <div className="hidden sm:flex space-x-2">
              <Button variant="ghost" size="sm">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-gray-800 text-white text-xs">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content - Column Layout */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Calendar Section */}
        <div className="w-full">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-1">
                  <Button 
                    variant={currentView === 'Day' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCurrentView('Day')}
                  >
                    Day
                  </Button>
                  <Button 
                    variant={currentView === 'Week' ? 'default' : 'ghost'} 
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800"
                    onClick={() => setCurrentView('Week')}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={currentView === 'Month' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCurrentView('Month')}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={currentView === 'Year' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCurrentView('Year')}
                  >
                    Year
                  </Button>
                </div>
                <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </div>
            </div>
          </div>

          {/* Schedule Calendar */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                <h2 className="font-medium text-gray-900">Schedule</h2>
                <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-4 text-sm w-full lg:w-auto">
                  <div className="text-gray-500 text-center py-2">Monday 13</div>
                  <div className="text-gray-500 text-center py-2">Tuesday 14</div>
                  <div className="text-gray-500 text-center py-2">Wednesday 15</div>
                  <div className="text-gray-500 text-center py-2">Thursday 16</div>
                  <div className="font-medium text-gray-900 text-center py-2 bg-gray-50 rounded">Friday 18</div>
                  <div className="text-gray-500 text-center py-2">Saturday 18</div>
                  <div className="text-gray-500 text-center py-2">Sunday 18</div>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="p-4">
              <div className="space-y-4">
                {[
                  { time: '08:00', appointments: [
                    { name: 'James Anderson', type: '2BR Apartment Viewing', status: 'Pending' }
                  ]},
                  { time: '09:00', appointments: [
                    { name: 'James Anderson', type: '2BR Apartment Viewing', status: 'Pending', time: '8:10-9:50 PM' }
                  ]},
                  { time: '10:00', appointments: [
                    { name: 'Robert White', type: 'Townhouse Visit', status: 'Confirmed' },
                    { name: 'Emily Johnson', type: 'Penthouse Tour', status: 'Pending', time: '9:50-10:30 PM' }
                  ]},
                  { time: '11:00', appointments: [
                    { name: 'Robert White', type: 'Townhouse Visit', status: 'Confirmed', time: '10:00-11:20 PM' }
                  ]},
                  { time: '12:00', appointments: [
                    { name: 'James Anderson', type: '2BR Apartment Viewing', status: 'Pending' }
                  ]},
                  { time: '13:00', appointments: [
                    { name: 'Robert White', type: 'Townhouse Visit', status: 'Confirmed', time: '11:30-1:00 PM' }
                  ]}
                ].map((timeSlot, idx) => (
                  <div key={idx} className="flex flex-col lg:flex-row space-y-4 lg:space-y-0">
                    <div className="w-full lg:w-16 text-sm text-gray-500 font-medium lg:pt-2 text-center lg:text-left border-b lg:border-b-0 pb-2 lg:pb-0">
                      {timeSlot.time}
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                        {timeSlot.appointments.map((appointment, appointmentIdx) => (
                          <div key={appointmentIdx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                  {appointment.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {appointment.name}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {appointment.type}
                              </p>
                              {appointment.time && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1 shrink-0" />
                                  <span className="line-clamp-1">{appointment.time}</span>
                                </div>
                              )}
                              <Badge 
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  getStatusColor(appointment.status)
                                )}
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Students Section - Now Below Calendar */}
        <div className="w-full">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 mb-6">
              <h3 className="text-xl font-semibold text-gray-900">All Students (398)</h3>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Quick Connects" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 max-w-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.slice(0, 12).map((student) => (
                <div key={student.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={student.avatarUrl} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
                          {student.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{student.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{student.type}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Video className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Next:</span>
                      <span className="font-medium text-gray-700 truncate ml-2">{student.nextAppointment}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{student.lastContact}</span>
                      <Badge className={cn("text-xs px-2 py-0.5 shrink-0", getStatusColor(student.status || 'active'))}>
                        {student.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline" className="text-gray-600 border-gray-200">
                Load More Students
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}