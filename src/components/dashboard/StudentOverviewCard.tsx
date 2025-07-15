
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Calendar, UserCheck, AlertCircle, Sparkle, Clock } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

type Student = {
  id: string;
  fullName: string;
  universityId: string;
  lastSession?: string;
  nextSession?: string;
  avatarUrl?: string;
  aiHint?: string;
  status: 'Active' | 'Inactive' | 'Needs Follow-up' | 'New';
};

interface StudentOverviewCardProps {
  student: Student;
  isSelected: boolean;
  onSelectionChange: (studentId: string, isSelected: boolean) => void;
}

const statusConfig = {
  Active: {
    icon: UserCheck,
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  },
  'Needs Follow-up': {
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  },
  Inactive: {
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  },
  New: {
    icon: Sparkle,
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  },
};

export function StudentOverviewCard({ student, isSelected, onSelectionChange }: StudentOverviewCardProps) {
  const { icon: StatusIcon, className: statusClassName } = statusConfig[student.status];

  return (
    <Card className={`shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card ${isSelected ? 'border-primary ring-2 ring-primary' : ''}`}>
      <div className="absolute top-3 right-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(student.id, !!checked)}
          aria-label={`Select ${student.fullName}`}
        />
      </div>
      <CardHeader className="flex flex-row items-center gap-4 p-5">
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={student.avatarUrl} alt={student.fullName} data-ai-hint={student.aiHint} />
          <AvatarFallback className="text-xl">{student.fullName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-bold truncate">{student.fullName}</h3>
          <p className="text-sm text-muted-foreground">ID: {student.universityId}</p>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-3 flex-grow">
        <Badge variant="outline" className={`w-fit font-semibold ${statusClassName}`}>
          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
          {student.status}
        </Badge>
        <div className="text-sm text-muted-foreground space-y-2">
            {student.nextSession ? (
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Next Session: {formatDistanceToNowStrict(parseISO(student.nextSession), { addSuffix: true })}</span>
                </div>
            ) : student.lastSession ? (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last Session: {formatDistanceToNowStrict(parseISO(student.lastSession), { addSuffix: true })}</span>
                </div>
            ) : (
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>No session history</span>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t">
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/counselor/students/${student.id}/profile`}>
            View Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
