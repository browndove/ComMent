
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Videotape, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  Maximize,
  Minimize,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import useSound from 'use-sound';

// Placeholder for user and peer info
// In a real app, this would be fetched based on the session
const getParticipantInfo = (role?: 'student' | 'counselor' | null) => {
    if (role === 'student') {
        return {
            currentUser: { name: "Adjoa Mensah", role: "Student", avatarUrl: "https://placehold.co/100x100.png", aiHint: "student photo" },
            peerUser: { name: "Dr. Beryl Osei", role: "Counselor", avatarUrl: "https://placehold.co/100x100.png", aiHint: "professional portrait" }
        }
    }
     return {
        currentUser: { name: "Dr. Beryl Osei", role: "Counselor", avatarUrl: "https://placehold.co/100x100.png", aiHint: "professional portrait" },
        peerUser: { name: "Adjoa Mensah", role: "Student", avatarUrl: "https://placehold.co/100x100.png", aiHint: "student photo" }
    }
}


export function VideoCallInterface() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);

  const { currentUser, peerUser } = getParticipantInfo(user?.role);
  
  const [playConnect] = useSound('/sounds/connect.mp3', { volume: 0.5 });
  const [playDisconnect] = useSound('/sounds/disconnect.mp3', { volume: 0.5 });
  const [playMessage] = useSound('/sounds/message.mp3', { volume: 0.5 });

  useEffect(() => {
    // Simulate peer connection for demo purposes
    const timer = setTimeout(() => {
      setCallAccepted(true);
      if(userVideo.current) {
         userVideo.current.srcObject = null; // Clear placeholder
         playConnect();
      }
      toast({ title: "Peer Connected", description: `${peerUser.name} has joined the call.` });
    }, 3000);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // In a real app, you would use a signaling server (like Socket.IO)
        // to exchange peer data and establish a connection.
        // For this demo, we are simulating the connection.
      })
      .catch((err) => {
        console.error('Failed to get media devices.', err);
        toast({
          variant: 'destructive',
          title: 'Media Error',
          description: 'Could not access camera or microphone. Please check permissions.',
        });
      });
      
      return () => clearTimeout(timer);
  }, [toast, playConnect, peerUser.name]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
        const message = { sender: 'You', text: newMessage.trim() };
        setMessages([...messages, message]);
        // In a real app, you would send this message via peer.send()
        setNewMessage('');
        playMessage();
    }
  };

  const leaveCall = () => {
    setCallAccepted(false);
    stream?.getTracks().forEach(track => track.stop());
    peer?.destroy();
    playDisconnect();
    // Redirect or show a "Call Ended" screen
    toast({ title: "Call Ended", description: "You have left the session." });
    // In a real app, router.push('/dashboard') or similar
  };
  
   const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };


  return (
    <div className="relative h-screen w-screen bg-gray-900 text-white flex flex-col md:flex-row overflow-hidden">

       {/* Video Grid */}
       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
            <div className="relative bg-black rounded-lg overflow-hidden h-full w-full">
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                 <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded-lg text-sm">{currentUser.name} (You)</div>
                 {isVideoOff && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                         <Avatar className="h-32 w-32 border-4 border-gray-600">
                             <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint={currentUser.aiHint} />
                             <AvatarFallback className="text-4xl bg-gray-700">{currentUser.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                         </Avatar>
                        <p className="mt-4 font-semibold text-lg">{currentUser.name}</p>
                        <p className="text-sm text-gray-400">Video is off</p>
                    </div>
                )}
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden h-full w-full">
                {callAccepted ? (
                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 animate-pulse">
                        <p>Connecting to {peerUser.name}...</p>
                    </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded-lg text-sm">{peerUser.name}</div>
            </div>
        </div>

       {/* Chat & Participants Panel */}
       <div className="w-full md:w-80 bg-gray-950 flex flex-col border-l border-gray-700/50">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Session Chat</h2>
                 <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Users className="h-5 w-5"/>
                </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={cn("flex", msg.sender === 'You' ? "justify-end" : "justify-start")}>
                            <div className={cn("rounded-lg px-3 py-2 max-w-xs", msg.sender === 'You' ? "bg-primary text-primary-foreground" : "bg-gray-800")}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-gray-700/50">
                <div className="relative">
                    <Textarea 
                        placeholder="Type a message..."
                        className="bg-gray-800 border-gray-700 rounded-lg pr-12 text-white"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    />
                    <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" onClick={handleSendMessage}>
                        <Send className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
       </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4">
        <div className="bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center gap-4 p-3 shadow-2xl">
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white/10" onClick={toggleMute}>
            {isMuted ? <MicOff className="h-6 w-6 text-red-500" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white/10" onClick={toggleVideo}>
            {isVideoOff ? <VideoOff className="h-6 w-6 text-red-500" /> : <Videotape className="h-6 w-6" />}
          </Button>
           <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={leaveCall}>
            <PhoneOff className="h-7 w-7" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white/10">
            <MessageSquare className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white/10" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
