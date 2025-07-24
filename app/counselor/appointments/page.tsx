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
  Bell,
  Download,
  Settings,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for demonstration
const mockUser = { uid: 'counselor-1', name: 'Dr. Adams' };

// Enhanced Header Component
const DashboardHeader = ({ user, onNewSession }) => (
  <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">h.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/api/placeholder/32/32" alt={user?.name} />
            <AvatarFallback>{user?.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search" 
            className="pl-10 bg-gray-50 border-0 w-full sm:w-64"
          />
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={onNewSession} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>
    </div>
  </div>
);

// Enhanced Stats Card Component with trends
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendDirection = 'up',
  color = "blue",
  loading = false 
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  const TrendIcon = trendDirection === 'up' ? ArrowUp : ArrowDown;
  const trendColor = trendDirection === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : value}
              </p>
              {trend && (
                <div className={`flex items-center gap-1 ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">{trend}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-lg bg-gray-50 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Appointment Card Component
const AppointmentCard = ({ appointment, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleUpdate = async (status) => {
    setIsUpdating(true);
    await onUpdateStatus(appointment.id, status);
    setIsUpdating(false);
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 bg-white border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
              <AvatarImage src={appointment.studentAvatarUrl} alt={appointment.studentName} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {appointment.studentName?.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{appointment.studentName}</h4>
              <p className="text-xs sm:text-sm text-gray-500">Student</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
              <DropdownMenuItem><Edit3 className="w-4 h-4 mr-2" />Edit Notes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdate('cancelled')} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{new Date(appointment.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusVariant(appointment.status)} px-2 py-1 text-xs font-medium rounded-full`}>
              {appointment.status}
            </Badge>
          </div>
        </div>
        
        {appointment.reason && (
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <p className="text-xs sm:text-sm text-gray-600 italic">"{appointment.reason}"</p>
          </div>
        )}
        
        {appointment.status.toLowerCase() === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => handleUpdate('confirmed')} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm" 
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleUpdate('cancelled')} 
              className="flex-1 text-xs sm:text-sm" 
              disabled={isUpdating}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Patient Visit Chart Component
const PatientVisitsChart = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maleData = [20, 25, 30, 25, 35, 40, 45, 50, 45, 40, 35, 30];
  const femaleData = [15, 20, 25, 30, 25, 30, 35, 40, 35, 30, 25, 20];
  const childrenData = [10, 15, 20, 15, 20, 25, 30, 35, 30, 25, 20, 15];

  return (
    <Card className="bg-white border-0 shadow-sm col-span-full lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl text-gray-900">Student Sessions</CardTitle>
            <CardDescription className="text-sm text-gray-600">Monthly session trends by demographics</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Male</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Female</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Children</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  2023 <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>2023</DropdownMenuItem>
                <DropdownMenuItem>2022</DropdownMenuItem>
                <DropdownMenuItem>2021</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80 relative">
          <svg className="w-full h-full" viewBox="0 0 800 300">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="60"
                y1={50 + i * 50}
                x2="750"
                y2={50 + i * 50}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Y-axis labels */}
            {[60, 45, 30, 15, 0].map((value, i) => (
              <text
                key={i}
                x="45"
                y={55 + i * 50}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            ))}
            
            {/* X-axis labels */}
            {months.map((month, i) => (
              <text
                key={i}
                x={90 + i * 55}
                y="285"
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {month}
              </text>
            ))}
            
            {/* Male line */}
            <path
              d={`M 90 ${250 - maleData[0] * 3.33} ${maleData.slice(1).map((value, i) => `L ${90 + (i + 1) * 55} ${250 - value * 3.33}`).join(' ')}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Female line */}
            <path
              d={`M 90 ${250 - femaleData[0] * 3.33} ${femaleData.slice(1).map((value, i) => `L ${90 + (i + 1) * 55} ${250 - value * 3.33}`).join(' ')}`}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Children line */}
            <path
              d={`M 90 ${250 - childrenData[0] * 3.33} ${childrenData.slice(1).map((value, i) => `L ${90 + (i + 1) * 55} ${250 - value * 3.33}`).join(' ')}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {maleData.map((value, i) => (
              <circle
                key={i}
                cx={90 + i * 55}
                cy={250 - value * 3.33}
                r="3"
                fill="#3b82f6"
                className="drop-shadow-sm"
              />
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

// Calendar Component
const MiniCalendar = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900">Calendar</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                August <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>August</DropdownMenuItem>
              <DropdownMenuItem>September</DropdownMenuItem>
              <DropdownMenuItem>October</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-gray-500 font-medium py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="aspect-square flex items-center justify-center">
              {day && (
                <button
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
                    day === 9 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function CounselorAppointmentsPage() {
  const [user] = useState(mockUser);
  const [allAppointments, setAllAppointments] = useState([
    {
      id: '1',
      studentName: 'Amanda Brown',
      studentAvatarUrl: '/api/placeholder/40/40',
      date: '2025-07-21',
      time: '11:30 AM',
      status: 'Pending',
      reason: 'Anxiety and stress management consultation'
    },
    {
      id: '2',
      studentName: 'Brooklyn Simmons',
      studentAvatarUrl: '/api/placeholder/40/40',
      date: '2025-07-21',
      time: '2:00 PM',
      status: 'Confirmed',
      reason: 'Academic performance discussion'
    },
    {
      id: '3',
      studentName: 'Courtney Henry',
      studentAvatarUrl: '/api/placeholder/40/40',
      date: '2025-07-22',
      time: '10:00 AM',
      status: 'Pending',
      reason: 'Career guidance session'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateStatus = async (id, newStatus) => {
    const originalAppointments = [...allAppointments];
    setAllAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : a));
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
      totalSessions: 989,
      thisMonth: 287,
      hardCases: 24,
    };
  }, [allAppointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onNewSession={() => {}} />
      
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatsCard 
            title="Online Consultations" 
            value={stats.totalSessions}
            icon={Activity} 
            color="blue" 
            loading={loading} 
          />
          <StatsCard 
            title="Students this Month" 
            value={`+${stats.thisMonth}`}
            trend="+4.11%"
            trendDirection="up"
            icon={Users} 
            color="green" 
            loading={loading} 
          />
          <StatsCard 
            title="Hard Cases" 
            value={`+${stats.hardCases}`}
            trend="+2.34%"
            trendDirection="down"
            icon={AlertTriangle} 
            color="red" 
            loading={loading} 
          />
          <StatsCard 
            title="Average Sessions" 
            value="$3.2k"
            trend="+8.24%"
            trendDirection="up"
            icon={TrendingUp} 
            color="purple" 
            loading={loading} 
          />
          <div className="col-span-2 lg:col-span-1">
            <Card className="bg-white border-0 shadow-sm h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600 font-medium">Recent Students</p>
                  <Button variant="ghost" size="sm" className="text-blue-600 text-sm">+14</Button>
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3,4,5,6].map(i => (
                    <Avatar key={i} className="w-8 h-8 border-2 border-white">
                      <AvatarImage src={`/api/placeholder/32/32`} />
                      <AvatarFallback>S{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts and Calendar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PatientVisitsChart />
          <MiniCalendar />
        </div>

        {/* Appointments Section */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl text-gray-900">Upcoming Appointments</CardTitle>
                <CardDescription className="text-sm text-gray-600">Manage your scheduled sessions</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search students..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 bg-gray-50 border-0 w-full sm:w-64" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  {['All', 'Pending', 'Confirmed', 'History'].map(f => (
                    <Button 
                      key={f} 
                      variant={filter === f ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setFilter(f)}
                      className={filter === f ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      {f}
                      {f === 'Pending' && stats.pendingAppointments > 0 && (
                        <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                          {stats.pendingAppointments}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredAppointments.map(appointment => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  There are no appointments matching your current filter criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}