
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Sparkles, Loader2, User, Calendar, Clock, Undo2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '../ui/badge';

interface SessionNotesEditorProps {
  sessionId: string;
  studentName: string;
}

// Mock data, in a real app this would be fetched
const sessionDetails = {
    date: '2023-10-26',
    time: '14:00',
    type: 'Video Call',
    status: 'Completed',
};

export function SessionNotesEditor({ sessionId, studentName }: SessionNotesEditorProps) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving notes for session:', sessionId, { notes });
    toast({
      title: 'Notes Saved',
      description: 'Your session notes have been successfully saved.',
    });
    setIsSaving(false);
  };
  
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    // Simulate AI call
    await new Promise(resolve => setTimeout(resolve, 2000));
    const summary = `Summary for ${studentName}:\nThe student expressed feelings of anxiety related to upcoming exams. We discussed coping mechanisms, including mindfulness exercises and a structured study plan. The student appeared receptive and agreed to try the techniques. A follow-up is scheduled in two weeks.`;
    setNotes(prev => `${prev}\n\n--- AI Summary ---\n${summary}`);
    toast({
      title: 'AI Summary Generated',
      description: 'An AI-powered summary has been added to your notes.',
    });
    setIsGenerating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Main Editor Column */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Session Notes for {studentName}</CardTitle>
            <CardDescription>
              Record your observations and plans for session ID: {sessionId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Start typing your confidential session notes here..."
              className="h-96 text-base"
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button
              onClick={handleSave}
              disabled={isSaving || !notes}
              className="w-32"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Notes
            </Button>
            <p className="text-sm text-muted-foreground">
              {notes.length} characters
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* AI Tools & Info Column */}
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Assistant Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
                Use AI to enhance your workflow.
            </p>
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating || !notes}
              variant="outline"
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Summary
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
             <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{studentName}</span>
            </div>
             <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(sessionDetails.date).toLocaleDateString()}</span>
            </div>
             <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{sessionDetails.time}</span>
            </div>
             <div className="flex items-center gap-3">
                <Badge variant="secondary">{sessionDetails.type}</Badge>
                <Badge>{sessionDetails.status}</Badge>
            </div>
          </CardContent>
          <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/counselor/appointments">
                    <Undo2 className="mr-2 h-4 w-4"/>
                    Back to all appointments
                  </a>
              </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
