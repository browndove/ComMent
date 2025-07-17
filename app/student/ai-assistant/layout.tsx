'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getUserConversations } from "@/lib/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare, Loader2, AlertTriangle, Bot, Menu, X, Sparkles, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Conversation {
    id: string;
    title: string;
}

export default function AiAssistantLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            setError(null);
            getUserConversations(user.uid).then(result => {
                if (result.error) {
                    setError(result.error);
                } else if (result.data) {
                    setConversations(result.data);
                }
                setIsLoading(false);
            });
        }
    }, [user, pathname]);

    // Close mobile menu when pathname changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const toggleMobileMenu = () => {
        setIsAnimating(true);
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-32 p-4">
            <div className="relative">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className="p-6 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
            <p className="text-xs text-muted-foreground/80">Start a new chat to begin!</p>
        </div>
    );

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b bg-gradient-to-r from-background to-muted/20">
                <Button 
                    asChild 
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Link href="/student/ai-assistant">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">New Chat</span>
                        <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <nav className="p-3 space-y-1">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <Alert variant="destructive" className="m-2 border-red-200 bg-red-50/50">
                                <AlertTriangle className="h-4 w-4 animate-bounce" />
                                <AlertTitle>Error Fetching Chats</AlertTitle>
                                <AlertDescription className="text-xs whitespace-pre-wrap">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        </div>
                    ) : conversations.length > 0 ? (
                        <div className="space-y-1">
                            {conversations.map((convo, index) => (
                                <div
                                    key={convo.id}
                                    className="animate-in slide-in-from-left-2 duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Link
                                        href={`/student/ai-assistant/${convo.id}`}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                                            pathname === `/student/ai-assistant/${convo.id}` 
                                                ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20 scale-[1.02]" 
                                                : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        <div className="relative">
                                            <MessageSquare className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                                            {pathname === `/student/ai-assistant/${convo.id}` && (
                                                <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <span className="truncate font-medium group-hover:translate-x-1 transition-transform duration-200">
                                            {convo.title}
                                        </span>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Zap className="h-3 w-3 text-primary" />
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="animate-in fade-in-0 duration-500">
                            <EmptyState />
                        </div>
                    )}
                </nav>
            </ScrollArea>
        </>
    );

    return (
        <div className="space-y-4 md:space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
                <div className="flex items-center space-x-3 group">
                    <div className="relative">
                        <Bot className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -inset-1 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-headline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        AI Assistant
                    </h1>
                </div>
                
                {/* Mobile menu button */}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleMobileMenu}
                    className="md:hidden relative overflow-hidden group hover:bg-primary/10 transition-all duration-300 hover:scale-110 active:scale-95"
                    disabled={isAnimating}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <div className="relative">
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
                        ) : (
                            <Menu className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        )}
                    </div>
                </Button>
            </div>

            {/* Main content area */}
            <div className="border rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex-grow flex overflow-hidden relative bg-gradient-to-br from-background to-muted/20 animate-in slide-in-from-bottom-2 duration-500">
                {/* Desktop sidebar */}
                <div className="hidden md:flex w-1/4 min-w-[250px] lg:min-w-[300px] bg-gradient-to-b from-muted/30 to-muted/10 border-r border-border/50 flex-col backdrop-blur-sm">
                    <SidebarContent />
                </div>

                {/* Mobile sidebar overlay */}
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in-0 duration-300"
                            onClick={toggleMobileMenu}
                        />
                        
                        {/* Sidebar */}
                        <div className="md:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-b from-muted/40 to-muted/10 border-r border-border/50 z-50 flex flex-col backdrop-blur-lg shadow-2xl animate-in slide-in-from-left-full duration-300">
                            {/* Mobile header */}
                            <div className="p-4 border-b bg-gradient-to-r from-background/80 to-muted/20 flex items-center justify-between backdrop-blur-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <Bot className="h-5 w-5 text-primary animate-pulse" />
                                        <div className="absolute -inset-1 bg-primary/20 rounded-full animate-ping" />
                                    </div>
                                    <span className="font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                        Conversations
                                    </span>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={toggleMobileMenu}
                                    className="hover:bg-primary/10 transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <X className="h-4 w-4 hover:rotate-90 transition-transform duration-200" />
                                </Button>
                            </div>
                            
                            <SidebarContent />
                        </div>
                    </>
                )}

                
                <div className="flex-1 flex flex-col min-w-0 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />
                    <div className="relative z-10 flex-1 flex flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}