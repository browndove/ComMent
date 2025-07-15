
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { subDays, format, parseISO } from 'date-fns';

interface Appointment {
  date: string; // Assuming 'YYYY-MM-DD' format
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

interface ChartData {
  name: string; // Date string
  Completed: number;
  Confirmed: number;
  Cancelled: number;
}

interface AppointmentsChartProps {
  data: Appointment[];
}

export function AppointmentsChart({ data = [] }: AppointmentsChartProps) {
  const processChartData = (appointments: Appointment[]): ChartData[] => {
    const last30Days = new Map<string, { Completed: number; Confirmed: number; Cancelled: number }>();
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'MMM d');
      last30Days.set(formattedDate, { Completed: 0, Confirmed: 0, Cancelled: 0 });
    }

    appointments.forEach(appointment => {
      const appointmentDate = parseISO(appointment.date);
      const formattedDate = format(appointmentDate, 'MMM d');
      
      if (last30Days.has(formattedDate)) {
        const dayData = last30Days.get(formattedDate);
        if (dayData) {
          switch (appointment.status) {
            case 'Completed':
              dayData.Completed++;
              break;
            case 'Confirmed':
              dayData.Confirmed++;
              break;
            case 'Cancelled':
              dayData.Cancelled++;
              break;
            default:
              break;
          }
        }
      }
    });

    return Array.from(last30Days.entries()).map(([name, values]) => ({
      name,
      ...values,
    }));
  };

  const chartData = processChartData(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
        />
        <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }}/>
        <Bar dataKey="Completed" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Confirmed" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]}/>
        <Bar dataKey="Cancelled" stackId="a" fill="hsl(var(--destructive) / 0.6)" radius={[4, 4, 0, 0]}/>
      </BarChart>
    </ResponsiveContainer>
  );
}
