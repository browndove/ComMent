
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Loader2 } from "lucide-react";

export type Appointment = {
  id: string;
  studentName: string;
  studentAvatarUrl?: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  reason: string;
};

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus: (id: string, newStatus: 'Confirmed' | 'Cancelled') => Promise<void>;
}

export function AppointmentCard({ appointment, onUpdateStatus }: AppointmentCardProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  const handleUpdate = async (newStatus: 'Confirmed' | 'Cancelled') => {
    setIsUpdating(true);
    await onUpdateStatus(appointment.id, newStatus);
    setIsUpdating(false);
  };
  
  const statusStyles: { [key: string]: string } = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Confirmed: "bg-green-100 text-green-800 border-green-300",
    Completed: "bg-blue-100 text-blue-800 border-blue-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={appointment.studentAvatarUrl} alt={appointment.studentName} />
            <AvatarFallback>{appointment.studentName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{appointment.studentName}</CardTitle>
             <Badge variant="outline" className={`mt-1 ${statusStyles[appointment.status]}`}>
              {appointment.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Clock className="h-4 w-4" />
            <span>{appointment.time}</span>
        </div>
         <p className="text-sm text-muted-foreground pt-2 border-t mt-3 italic line-clamp-2">
           &quot;{appointment.reason}&quot;
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {appointment.status === 'Pending' && (
          <>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdate('Cancelled')}
                disabled={isUpdating}
            >
                Decline
            </Button>
            <Button 
                size="sm" 
                onClick={() => handleUpdate('Confirmed')}
                disabled={isUpdating}
            >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Confirm'}
            </Button>
          </>
        )}
        {(appointment.status === 'Confirmed') && (
             <Button variant="secondary" size="sm">View Details</Button>
        )}
      </CardFooter>
    </Card>
  );
}
