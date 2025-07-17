import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download,
  Bell,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Video,
  Phone,
  MessageCircle,
  MapPin,
  User,
  Flag,
  AlertTriangle,
  Eye,
  Edit,
  Loader2,
  ChevronDown,
  CalendarDays,
  BarChart3,
  PieChart,
  FileText,
  Settings,
  Zap,
  Target,
  Activity,
  Save,
  X,
  UserPlus,
  Mail,
  Building,
  GraduationCap,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Types
type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
type Priority = 'low' | 'normal' | 'high' | 'urgent';
type ContactMethod = 'video' | 'phone' | 'in-person' | 'chat';
type AppointmentType = 'initial-consultation' | 'follow-up' | 'emergency' | 'group-session' | 'assessment';

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  year: string;
  major: string;
  avatarUrl?: string;
  emergencyContact?: string;
  previousAppointments?: number;
};

type Appointment = {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl?: string;
  counselorId: string;
  date: string;
  time: string;
  timezone: string;
  status: AppointmentStatus;
  reason: string;
  appointmentType: AppointmentType;
  contactMethod: ContactMethod;
  priority: Priority;
  referralSource?: string;
  createdAt: Date;
  modifiedAt: Date;
  duration: number;
  notes?: string;
  studentInfo?: Student;
};

// Configuration objects
const statusConfig = {
  pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock3, label: "Pending" },
  confirmed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Confirmed" },
  completed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2, label: "Completed" },
  cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Cancelled" },
  'no-show': { color: "bg-gray-50 text-gray-700 border-gray-200", icon: AlertCircle, label: "No Show" },
  rescheduled: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: Clock, label: "Rescheduled" }
};

const priorityConfig = {
  low: { color: "bg-slate-100 text-slate-600", icon: Flag },
  normal: { color: "bg-blue-100 text-blue-600", icon: Flag },
  high: { color: "bg-orange-100 text-orange-600", icon: Flag },
  urgent: { color: "bg-red-100 text-red-600", icon: AlertTriangle }
};

const contactMethodConfig = {
  video: { icon: Video, label: "Video Call", color: "text-blue-600" },
  phone: { icon: Phone, label: "Phone Call", color: "text-green-600" },
  'in-person': { icon: Users, label: "In Person", color: "text-purple-600" },
  chat: { icon: MessageCircle, label: "Chat", color: "text-orange-600" }
};

const appointmentTypeConfig = {
  'initial-consultation': { label: "Initial Consultation", color: "bg-blue-100 text-blue-800" },
  'follow-up': { label: "Follow-up", color: "bg-green-100 text-green-800" },
  'emergency': { label: "Emergency", color: "bg-red-100 text-red-800" },
  'group-session': { label: "Group Session", color: "bg-purple-100 text-purple-800" },
  'assessment': { label: "Assessment", color: "bg-orange-100 text-orange-800" }
};

// Mock data
const mockStudents: Student[] = [
  {
    id: 'student1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    phone: '+1 (555) 123-4567',
    year: 'Sophomore',
    major: 'Psychology',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b332c1a4?w=150',
    emergencyContact: '+1 (555) 987-6543',
    previousAppointments: 2
  },
  {
    id: 'student2',
    name: 'Michael Chen',
    email: 'michael.chen@university.edu',
    phone: '+1 (555) 234-5678',
    year: 'Junior',
    major: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    emergencyContact: '+1 (555) 876-5432',
    previousAppointments: 1
  },
  {
    id: 'student3',
    name: 'Emma Williams',
    email: 'emma.williams@university.edu',
    phone: '+1 (555) 345-6789',
    year: 'Freshman',
    major: 'Biology',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    emergencyContact: '+1 (555) 765-4321',
    previousAppointments: 0
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    studentId: 'student1',
    studentName: 'Sarah Johnson',
    studentAvatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b332c1a4?w=150',
    counselorId: 'counselor1',
    date: '2025-07-17',
    time: '09:00',
    timezone: 'Africa/Accra',
    status: 'pending',
    reason: 'Feeling anxious about upcoming exams and need coping strategies',
    appointmentType: 'initial-consultation',
    contactMethod: 'video',
    priority: 'normal',
    referralSource: 'Academic Advisor',
    createdAt: new Date('2025-07-15'),
    modifiedAt: new Date('2025-07-15'),
    duration: 60,
    studentInfo: mockStudents[0]
  },
  {
    id: '2',
    studentId: 'student2',
    studentName: 'Michael Chen',
    studentAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    counselorId: 'counselor1',
    date: '2025-07-17',
    time: '11:00',
    timezone: 'Africa/Accra',
    status: 'confirmed',
    reason: 'Follow-up on stress management techniques we discussed',
    appointmentType: 'follow-up',
    contactMethod: 'video',
    priority: 'normal',
    createdAt: new Date('2025-07-14'),
    modifiedAt: new Date('2025-07-16'),
    duration: 45,
    studentInfo: mockStudents[1]
  },
  {
    id: '3',
    studentId: 'student3',
    studentName: 'Emma Williams',
    studentAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    counselorId: 'counselor1',
    date: '2025-07-17',
    time: '14:00',
    timezone: 'Africa/Accra',
    status: 'confirmed',
    reason: 'Having trouble adjusting to campus life and making friends',
    appointmentType: 'initial-consultation',
    contactMethod: 'in-person',
    priority: 'high',
    referralSource: 'Resident Assistant',
    createdAt: new Date('2025-07-13'),
    modifiedAt: new Date('2025-07-14'),
    duration: 60,
    studentInfo: mockStudents[2]
  }
];

// Enhanced Appointment Card Component
const AppointmentCard = ({ appointment, onUpdateStatus, onViewDetails, onEdit }: { 
  appointment: Appointment, 
  onUpdateStatus: (id: string, status: AppointmentStatus) => void,
  onViewDetails: (appointment: Appointment) => void,
  onEdit: (appointment: Appointment) => void
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const StatusIcon = statusConfig[appointment.status]?.icon || AlertCircle;
  const ContactIcon = contactMethodConfig[appointment.contactMethod]?.icon || Video;
  const PriorityIcon = priorityConfig[appointment.priority]?.icon || Flag;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleStatusUpdate = async (newStatus: AppointmentStatus) => {
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    onUpdateStatus(appointment.id, newStatus);
    setIsUpdating(false);
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      "border-l-4",
      appointment.priority === 'urgent' && "border-l-red-500",
      appointment.priority === 'high' && "border-l-orange-500",
      appointment.priority === 'normal' && "border-l-blue-500",
      appointment.priority === 'low' && "border-l-slate-500"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
              <AvatarImage src={appointment.studentAvatarUrl} alt={appointment.studentName} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                {appointment.studentName?.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">{appointment.studentName}</CardTitle>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className={cn("text-xs", statusConfig[appointment.status].color)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[appointment.status].label}
                </Badge>
                {appointment.priority !== 'normal' && (
                  <Badge variant="outline" className={cn("text-xs", priorityConfig[appointment.priority].color)}>
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {appointment.priority.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="font-medium">{formatTime(appointment.time)}</div>
            <div className="text-xs">{appointment.duration} min</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <ContactIcon className={cn("h-4 w-4", contactMethodConfig[appointment.contactMethod].color)} />
          <span>{contactMethodConfig[appointment.contactMethod].label}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          "{appointment.reason}"
        </p>
        
        <div className="flex gap-2 pt-2">
          {appointment.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                Decline
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                Confirm
              </Button>
            </>
          )}
          
          {appointment.status === 'confirmed' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
              Mark Complete
            </Button>
          )}
          
          <Button size="sm" variant="outline" onClick={() => onViewDetails(appointment)}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          
          <Button size="sm" variant="outline" onClick={() => onEdit(appointment)}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// New Appointment Form Component
const NewAppointmentForm = ({ onSubmit, onCancel, students }: { 
  onSubmit: (appointment: Partial<Appointment>) => void,
  onCancel: () => void,
  students: Student[]
}) => {
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    time: '',
    duration: 60,
    reason: '',
    appointmentType: 'initial-consultation' as AppointmentType,
    contactMethod: 'video' as ContactMethod,
    priority: 'normal' as Priority,
    referralSource: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAppointment: Partial<Appointment> = {
      ...formData,
      studentName: selectedStudent?.name || '',
      studentAvatarUrl: selectedStudent?.avatarUrl,
      timezone: 'Africa/Accra',
      status: 'pending',
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    
    onSubmit(newAppointment);
    setIsSubmitting(false);
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
    setFormData(prev => ({ ...prev, studentId }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="space-y-2">
          <Label htmlFor="student">Select Student</Label>
          <Select value={formData.studentId} onValueChange={handleStudentSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={student.avatarUrl} alt={student.name} />
                      <AvatarFallback className="text-xs">
                        {student.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.major} • {student.year}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Appointment Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Appointment Type</Label>
          <Select value={formData.appointmentType} onValueChange={(value: AppointmentType) => setFormData(prev => ({ ...prev, appointmentType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(appointmentTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <Badge variant="outline" className={cn("text-xs", config.color)}>
                    {config.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            required
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select value={formData.duration.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Method */}
        <div className="space-y-2">
          <Label htmlFor="contact">Contact Method</Label>
          <Select value={formData.contactMethod} onValueChange={(value: ContactMethod) => setFormData(prev => ({ ...prev, contactMethod: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(contactMethodConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className={cn("h-4 w-4", config.color)} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className={cn("h-4 w-4", config.color.replace('bg-', 'text-').replace('-100', '-600'))} />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Referral Source */}
        <div className="space-y-2">
          <Label htmlFor="referral">Referral Source (Optional)</Label>
          <Input
            id="referral"
            placeholder="e.g., Academic Advisor, Self-referral"
            value={formData.referralSource}
            onChange={(e) => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
          />
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Appointment</Label>
        <Textarea
          id="reason"
          placeholder="Describe the reason for this appointment..."
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          rows={3}
          required
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={2}
        />
      </div>

      {/* Selected Student Info */}
      {selectedStudent && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Selected Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedStudent.avatarUrl} alt={selectedStudent.name} />
                <AvatarFallback>
                  {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{selectedStudent.name}</div>
                <div className="text-sm text-muted-foreground">{selectedStudent.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Year:</span> {selectedStudent.year}
              </div>
              <div>
                <span className="font-medium">Major:</span> {selectedStudent.major}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {selectedStudent.phone}
              </div>
              <div>
                <span className="font-medium">Previous Appointments:</span> {selectedStudent.previousAppointments}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Appointment
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Student Registration Form Component
const StudentRegistrationForm = ({ onSubmit, onCancel }: { 
  onSubmit: (student: Partial<Student>) => void,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    year: '',
    major: '',
    emergencyContact: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newStudent: Partial<Student> = {
      ...formData,
      id: `student_${Date.now()}`,
      previousAppointments: 0
    };
    
    onSubmit(newStudent);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="student@university.edu"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year">Academic Year</Label>
          <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Freshman">Freshman</SelectItem>
              <SelectItem value="Sophomore">Sophomore</SelectItem>
              <SelectItem value="Junior">Junior</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Major */}
        <div className="space-y-2">
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            placeholder="e.g., Psychology, Computer Science"
            value={formData.major}
            onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
            required
          />
        </div>

        {/* Emergency Contact */}
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            placeholder="+1 (555) 987-6543"
            value={formData.emergencyContact}
            onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
          />
        </div>
      </div>
      {/* Form Actions */}