
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Plus, FileText, Loader2, AlertTriangle, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentSessions } from "@/lib/actions";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Note {
  id: string;
  sessionId: string;
  studentName: string;
  sessionDate: string;
  summaryPreview: string;
  lastUpdated: string;
}

export default function CounselorNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // In a real app, you'd fetch notes. We're using completed sessions as a proxy.
      const sessionsResult = await getStudentSessions(user.uid, true); // Assume this can fetch for counselor
      if (sessionsResult.error) throw new Error(sessionsResult.error);
      
      const completedSessions = sessionsResult.data.filter(s => s.status === 'Completed');
      
      const formattedNotes = completedSessions.map(session => ({
        id: session.id,
        sessionId: session.id,
        studentName: session.studentName || 'Unknown Student',
        sessionDate: format(new Date(session.date), 'PPP'),
        summaryPreview: session.reason || "No preview available.",
        lastUpdated: session.modifiedAt ? format(new Date(session.modifiedAt), 'PPp') : format(new Date(), 'PPp'),
      }));
      setNotes(formattedNotes);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(note =>
    note.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.sessionDate.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="border-l-4 border-l-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-foreground mb-2">Session Notes</h1>
              <p className="text-slate-600 dark:text-muted-foreground">Confidential session documentation and records</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="search" 
                  placeholder="Search notes..." 
                  className="pl-10 w-80 bg-white dark:bg-card border-slate-200 dark:border-border focus:border-slate-400" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground">
                <Link href="/counselor/students">
                  <Plus className="mr-2 h-4 w-4" /> New Note
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-destructive dark:bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-destructive-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Error loading notes</span>
              </div>
              <p className="text-red-600 dark:text-destructive-foreground/80 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          renderSkeleton()
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-4">
            {filteredNotes.map(note => (
              <Card key={note.id} className="bg-white dark:bg-card border-slate-200 dark:border-border hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500 dark:text-muted-foreground" />
                          <h3 className="font-medium text-slate-900 dark:text-foreground">{note.studentName}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{note.sessionDate}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 dark:text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                        {note.summaryPreview}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last updated: {note.lastUpdated}</span>
                      </div>
                    </div>
                    
                    <Button asChild variant="outline" className="ml-6 border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-accent">
                      <Link href={`/counselor/sessions/${note.sessionId}/notes`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Note
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-card border-slate-200 dark:border-border">
            <CardContent className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-400 dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-foreground mb-2">No session notes found</h3>
              <p className="text-slate-600 dark:text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm ? 
                  "No notes match your search criteria. Try adjusting your search terms." :
                  "Session notes will appear here once you complete sessions with students."
                }
              </p>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground">
                <Link href="/counselor/students">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Note
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
