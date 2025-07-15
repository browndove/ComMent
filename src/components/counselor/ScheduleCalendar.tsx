
'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Video, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from "@/components/dashboard/AppointmentCard";
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ScheduleCalendarProps {
  appointments: Appointment[];
}

const statusColors = {
  Confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const statusIcons = {
    Confirmed: CheckCircle,
    Pending: AlertCircle,
    Completed: CheckCircle,
    Cancelled: XCircle,
}

export function ScheduleCalendar({ appointments }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => isSameDay(new Date(appointment.date), day));
  };
  
  // Adjust to make Monday the first day of the week
  const adjustedDays = days.slice(1).concat(days.slice(0,1));
  
  if(getDay(startDate) !== 1) { // 1 is Monday
    // This logic needs to be more robust for different month starts
  }


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-bold text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px border-l border-t bg-border rounded-lg overflow-hidden">
          {weekdays.map(day => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground bg-card">
              {day}
            </div>
          ))}
          {days.map(day => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "relative min-h-[120px] p-2 bg-card border-r border-b",
                  !isCurrentMonth && "bg-muted/50 text-muted-foreground"
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className={cn("font-semibold", isToday && "bg-primary text-primary-foreground rounded-full flex items-center justify-center h-6 w-6")}>
                  {format(day, 'd')}
                </time>
                <div className="mt-1 space-y-1">
                  {dayAppointments.map(appointment => {
                    const StatusIcon = statusIcons[appointment.status as keyof typeof statusIcons] || Video;
                    return (
                        <Link href="/counselor/appointments" key={appointment.id}>
                        <div
                            className={cn(
                            'p-1.5 rounded-md text-xs leading-tight cursor-pointer hover:opacity-80 transition-opacity',
                            statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                            )}
                        >
                            <p className="font-bold flex items-center gap-1.5">
                               <StatusIcon className="h-3 w-3 shrink-0" />
                               {appointment.studentName}
                            </p>
                            <p className="ml-5 text-muted-foreground">{appointment.time}</p>
                        </div>
                        </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
