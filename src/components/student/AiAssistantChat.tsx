'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessageToAi } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface AiAssistantChatProps {
  conversationId: string | null;
  initialMessages: Message[];
}

const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.').max(1000, 'Message too long.'),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

export function AiAssistantChat({ conversationId, initialMessages }: AiAssistantChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChatInput>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: { message: '' },
  });
  const { formState, register, handleSubmit, reset, watch } = form;

  // Watch the message input to handle empty state
  const messageValue = watch('message');

  // This effect ensures that if the parent component passes new initialMessages
  // (e.g., by navigating to a different conversation), the state is updated.
  useEffect(() => {
    console.log('useEffect triggered with:', { initialMessages, conversationId });
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
    setCurrentConversationId(conversationId);
  }, [initialMessages, conversationId]);

  // Improved scroll to bottom function with multiple fallback methods
  const scrollToBottom = () => {
    // Method 1: Using messagesEndRef
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Method 2: Fallback using ScrollArea viewport
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Force scroll when loading state changes
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  const onSubmit = async (data: ChatInput) => {
    console.log('Form submitted with data:', data);
    
    if (!user) {
      console.log('No user found');
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    if (isLoading) {
      console.log('Already loading, preventing submission');
      return;
    }

    setIsLoading(true);
    
    // Create user message immediately
    const userMessage: Message = { 
      id: 'user-' + Date.now(), 
      text: data.message, 
      sender: 'user' 
    };
    
    setMessages(prev => [...prev, userMessage]);
    reset();

    try {
      console.log('Sending message to AI with:', { currentConversationId, userId: user.uid, message: data.message });
      const result = await sendMessageToAi(currentConversationId, user.uid, data.message);
      console.log('AI response result:', result);

      if (result.error) {
        console.error('AI response error:', result.error);
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        // Remove the user message on error
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      // Update conversation ID if new conversation was created
      if (result.newConversationId && !currentConversationId) {
        console.log('New conversation created:', result.newConversationId);
        setCurrentConversationId(result.newConversationId);
        router.replace(`/student/ai-assistant/${result.newConversationId}`, { scroll: false });
      }

      // Add AI response
      const aiMessage: Message = { 
        id: result.aiMessageId || 'ai-' + Date.now(), 
        text: result.aiResponse || 'Sorry, I encountered an error processing your request.', 
        sender: 'ai' 
      };

      setMessages(prev => {
        const newMessages = [...prev];
        // Update user message ID if available
        if (result.userMessageId) {
          const userMessageIndex = newMessages.findIndex(m => m.id === userMessage.id);
          if (userMessageIndex !== -1) {
            newMessages[userMessageIndex].id = result.userMessageId;
          }
        }
        // Add AI message
        newMessages.push(aiMessage);
        return newMessages;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to send message. Please try again.' 
      });
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };
  
  const WelcomeScreen = () => {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-6">
          <Bot className="h-16 w-16 text-primary"/>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Meet Ama</h2>
        <p className="text-muted-foreground text-lg mb-6 max-w-md">
          Your personal AI assistant for university life
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Card className="text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Study Support
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Get help with study techniques, time management, and academic planning
              </p>
            </CardContent>
          </Card>
          <Card className="text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Mental Health
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Find resources for stress management, wellness tips, and emotional support
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Start by typing your question below 👇
        </p>
      </div>
    );
  };

  // Debug info (remove in production)
  console.log('Component render - Messages array:', messages);
  console.log('Component render - Messages length:', messages.length);
  console.log('Component render - Initial messages:', initialMessages);
  console.log('Component render - Conversation ID:', currentConversationId);

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Scrollable Messages Container */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {!hasMessages ? (
              <WelcomeScreen />
            ) : (
              <div className="space-y-6">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={cn('flex items-start gap-4', message.sender === 'user' && 'justify-end')}
                  >
                    {message.sender === 'ai' && (
                      <Avatar className="h-9 w-9 border bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0">
                        <AvatarFallback className="bg-transparent">
                          <Bot className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'rounded-xl p-4 max-w-[80%] shadow-sm',
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="h-9 w-9 border flex-shrink-0">
                        <AvatarImage src={user?.avatarUrl} alt={user?.fullName || 'User'} />
                        <AvatarFallback className="bg-primary/10">
                          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-4">
                    <Avatar className="h-9 w-9 border bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-xl p-4 max-w-[80%] shadow-sm bg-muted rounded-bl-none">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Ama is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      
      {/* Input form - always visible at bottom */}
      <div className="border-t bg-background p-4 flex-shrink-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative max-w-4xl mx-auto"
        >
          <Textarea
            {...register('message')}
            placeholder="Ask Ama about stress, studies, or anything else..."
            className="pr-20 resize-none min-h-[60px] max-h-[120px]"
            rows={2}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            disabled={isLoading || !messageValue?.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        
        {formState.errors.message && (
          <p className="text-sm text-destructive mt-2 max-w-4xl mx-auto">
            {formState.errors.message.message}
          </p>
        )}
      </div>
    </div>
  );
}