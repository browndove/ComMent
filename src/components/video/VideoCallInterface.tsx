'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  Maximize,
  Minimize,
  Users,
  Settings,
  MoreHorizontal,
  Shield,
  Monitor,
  Volume2,
  ChevronUp,
  X,
  Pin,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Peer from 'simple-peer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot, updateDoc, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock user data - will be replaced by auth user
const getParticipantInfo = (role?: 'student' | 'counselor' | null, peerName?: string | null) => {
    if (role === 'student') {
        return {
            currentUser: { name: "Adjoa Mensah", role: "Student", avatarUrl: "https://placehold.co/100x100.png", aiHint: "student photo" },
            peerUser: { name: peerName || "Counselor", role: "Counselor", avatarUrl: "https://placehold.co/100x100.png", aiHint: "professional portrait" }
        }
    }
    return {
        currentUser: { name: "Dr. Nancy Darkoah", role: "Counselor", avatarUrl: "https://placehold.co/100x100.png", aiHint: "professional portrait" },
        peerUser: { name: peerName || "Student", role: "Student", avatarUrl: "https://placehold.co/100x100.png", aiHint: "student photo" }
    }
}

export function VideoCallInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const peerRef = useRef<Peer.Instance | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State tracking refs to prevent race conditions
  const connectionStateRef = useRef({
    hasProcessedOffer: false,
    hasProcessedAnswer: false,
    isInitiator: false,
    peerCreated: false
  });

  // Track if user has joined before
  const hasJoinedRef = useRef(false);
  
  const { currentUser, peerUser } = getParticipantInfo(user?.role);

  // Effect for setting up media devices
  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to get media devices.', err);
        toast({ variant: 'destructive', title: "Device Error", description: "Could not access camera or microphone." });
        setCallStatus('disconnected');
      }
    };
    setupMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [toast]);

  // Deterministic initiator selection based on user ID and current timestamp
  const isInitiator = useCallback(() => {
    if (!user?.uid || !sessionId) return false;
    // Use user ID comparison for consistency, but reset on rejoin
    return user.uid < sessionId;
  }, [user?.uid, sessionId]);

  // Create peer connection
  const createPeer = useCallback((initiator: boolean, stream: MediaStream) => {
    console.log(`Creating peer connection. Initiator: ${initiator}`);
    
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peer.on('signal', async (signalData) => {
      console.log('Generated signal:', initiator ? 'offer' : 'answer');
      try {
        const callDocRef = doc(db, 'videoCalls', sessionId);
        const signal = JSON.stringify(signalData);
        
        if (initiator) {
          await updateDoc(callDocRef, { 
            offer: signal, 
            initiatorId: user?.uid,
            offerTimestamp: Date.now()
          });
        } else {
          await updateDoc(callDocRef, { 
            answer: signal,
            answerTimestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Failed to send signal:', error);
        toast({ variant: 'destructive', title: "Connection Error", description: "Failed to send connection signal." });
      }
    });

    peer.on('stream', (stream) => {
      console.log('Received remote stream');
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setCallStatus('connected');
    });

    peer.on('connect', () => {
      console.log('Peer connection established');
      setCallStatus('connected');
    });

    peer.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString());
        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('Failed to parse chat message:', error);
      }
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      setCallStatus('disconnected');
      toast({ title: "Call Ended", description: "The other user has left the call." });
      router.push(user?.role === 'student' ? '/student/dashboard' : '/counselor/dashboard');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (!peer.destroyed) {
        setCallStatus('disconnected');
        toast({ variant: 'destructive', title: "Connection Error", description: "Failed to establish peer connection." });
      }
    });

    return peer;
  }, [sessionId, user?.uid, user?.role, toast, router]);

  // Main WebRTC connection effect
  useEffect(() => {
    if (!localStream || !user?.uid || !sessionId) return;

    setCallStatus('connecting');
    const callDocRef = doc(db, 'videoCalls', sessionId);
    const state = connectionStateRef.current;
    
    // Reset state for new connection
    state.hasProcessedOffer = false;
    state.hasProcessedAnswer = false;
    state.peerCreated = false;
    state.isInitiator = isInitiator();

    console.log(`Starting connection setup. User: ${user.uid}, Is initiator: ${state.isInitiator}`);

    // Clear old connection data and mark user as active
    const initializeConnection = async () => {
      try {
        const currentTime = Date.now();
        const updateData: any = {
          [`participants.${user.uid}`]: {
            name: currentUser.name,
            role: user.role,
            joinedAt: currentTime,
            isActive: true
          },
          lastActivity: currentTime
        };

        // If this is a fresh start or rejoin, clear old signals
        if (!hasJoinedRef.current) {
          updateData.offer = null;
          updateData.answer = null;
          updateData.initiatorId = null;
          hasJoinedRef.current = true;
        }

        await updateDoc(callDocRef, updateData);
      } catch (error) {
        console.error('Failed to initialize connection:', error);
      }
    };

    initializeConnection();

    const unsubscribe = onSnapshot(callDocRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data) {
        console.error('Call document does not exist');
        toast({ variant: 'destructive', title: "Call Error", description: "This call session does not exist." });
        setCallStatus('disconnected');
        return;
      }

      // Check if other user is active
      const participants = data.participants || {};
      const otherUsers = Object.keys(participants).filter(uid => uid !== user.uid);
      const hasActiveOtherUser = otherUsers.some(uid => participants[uid]?.isActive);

      console.log('Firestore update received:', { 
        hasOffer: !!data.offer, 
        hasAnswer: !!data.answer,
        peerCreated: state.peerCreated,
        hasActiveOtherUser,
        participants: Object.keys(participants)
      });

      // Only proceed if there's another active user
      if (!hasActiveOtherUser) {
        console.log('Waiting for other user to join...');
        return;
      }

      // Create peer if not already created
      if (!state.peerCreated && !peerRef.current) {
        // Determine initiator based on who joined first or fallback to ID comparison
        const userJoinTime = participants[user.uid]?.joinedAt || Date.now();
        const otherUserJoinTimes = otherUsers.map(uid => participants[uid]?.joinedAt || Date.now());
        const earliestOtherJoinTime = Math.min(...otherUserJoinTimes);
        
        // If user joined first, they become initiator, otherwise use ID comparison
        const shouldBeInitiator = userJoinTime < earliestOtherJoinTime || 
                                 (userJoinTime === earliestOtherJoinTime && user.uid < otherUsers[0]);
        
        state.isInitiator = shouldBeInitiator;
        state.peerCreated = true;
        peerRef.current = createPeer(state.isInitiator, localStream);
        
        console.log(`Peer created. Initiator: ${state.isInitiator}, User join time: ${userJoinTime}, Other join time: ${earliestOtherJoinTime}`);
      }

      // Handle incoming offer (for non-initiators)
      if (!state.isInitiator && data.offer && !state.hasProcessedOffer && peerRef.current) {
        console.log('Processing incoming offer');
        state.hasProcessedOffer = true;
        try {
          if (!peerRef.current.destroyed) {
            peerRef.current.signal(JSON.parse(data.offer));
          }
        } catch (error) {
          console.error('Failed to process offer:', error);
          toast({ variant: 'destructive', title: "Connection Error", description: "Failed to process connection offer." });
        }
      }

      // Handle incoming answer (for initiators)
      if (state.isInitiator && data.answer && !state.hasProcessedAnswer && peerRef.current) {
        console.log('Processing incoming answer');
        state.hasProcessedAnswer = true;
        try {
          if (!peerRef.current.destroyed) {
            peerRef.current.signal(JSON.parse(data.answer));
          }
        } catch (error) {
          console.error('Failed to process answer:', error);
          toast({ variant: 'destructive', title: "Connection Error", description: "Failed to process connection answer." });
        }
      }

    }, (error) => {
      console.error("Firestore snapshot error:", error);
      toast({ variant: 'destructive', title: "Connection Error", description: "Failed to connect to the signaling server." });
      setCallStatus('disconnected');
    });

    return () => {
      console.log('Cleaning up WebRTC connection');
      unsubscribe();
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.destroy();
      }
      peerRef.current = null;
      // Reset state
      connectionStateRef.current = {
        hasProcessedOffer: false,
        hasProcessedAnswer: false,
        isInitiator: false,
        peerCreated: false
      };
    };
  }, [localStream, user?.uid, sessionId, isInitiator, createPeer, toast, currentUser.name, user?.role]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(prev => !prev);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && peerRef.current?.connected) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const message = { sender: currentUser.name, text: newMessage.trim(), timestamp };
      try {
        peerRef.current.send(JSON.stringify(message));
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        toast({ variant: 'destructive', title: "Chat Error", description: "Failed to send message." });
      }
    }
  };

  const leaveCall = useCallback(async () => {
    console.log('Leaving call');
    
    // Mark user as inactive in Firestore
    try {
      const callDocRef = doc(db, 'videoCalls', sessionId);
      await updateDoc(callDocRef, {
        [`participants.${user?.uid}.isActive`]: false,
        [`participants.${user?.uid}.leftAt`]: Date.now()
      });
    } catch (error) {
      console.warn('Failed to update leave status:', error);
    }
    
    // Destroy peer connection
    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy();
    }
    peerRef.current = null;
    
    // Stop local media tracks
    localStream?.getTracks().forEach(track => track.stop());
    
    // Reset join tracking so they can rejoin
    hasJoinedRef.current = false;
    
    setCallStatus('disconnected');
    router.push(user?.role === 'student' ? '/student/dashboard' : '/counselor/dashboard');
  }, [localStream, sessionId, user?.uid, user?.role, router]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", {
              'bg-green-500': callStatus === 'connected',
              'bg-yellow-500 animate-pulse': callStatus === 'connecting',
              'bg-red-500': callStatus === 'disconnected'
            })}></div>
            <span className="text-sm text-gray-300">
              {callStatus === 'connected' ? 'Connected' : 
               callStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-lg font-medium text-white">Counseling Session</h1>
          <p className="text-sm text-gray-400">Secure & Confidential</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Shield className="h-4 w-4 mr-2" />
            End-to-End Encrypted
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Video Area */}
        <div className={cn("flex-1 relative bg-black transition-all duration-300", {
          "mr-80": showChat,
        })}>
          {/* Speaker View */}
          <div className="absolute inset-0">
            {callStatus === 'connected' && remoteStream ? (
              <div className="relative h-full w-full">
                <video 
                  playsInline 
                  ref={remoteVideoRef}
                  autoPlay 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={peerUser.avatarUrl} alt={peerUser.name} />
                      <AvatarFallback className="text-sm bg-blue-600">
                        {peerUser.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium text-sm">{peerUser.name}</p>
                      <p className="text-gray-300 text-xs">{peerUser.role}</p>
                    </div>
                    <Volume2 className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="animate-pulse mb-4">
                     <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    {callStatus === 'connecting' ? `Waiting for ${peerUser.name} to join...` : 'Call has ended'}
                  </h3>
                  <p className="text-gray-400">
                    {callStatus === 'connecting' ? 'Please wait while we establish the connection' : 'You can now close this window.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Self View (Picture-in-Picture) */}
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-gray-600 shadow-xl">
            <video 
              playsInline 
              muted 
              ref={localVideoRef}
              autoPlay 
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
                <Avatar className="h-16 w-16 border-2 border-gray-600">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback className="text-xl bg-gray-700">
                    {currentUser.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-gray-400 mt-2">Camera off</p>
              </div>
            )}
            <div className="absolute bottom-1 left-1 right-1">
              <div className="bg-black/60 rounded px-2 py-1">
                <p className="text-white text-xs font-medium truncate">{currentUser.name} (You)</p>
              </div>
            </div>
            {isMuted && (
              <div className="absolute top-2 left-2">
                <div className="bg-red-600 rounded-full p-1">
                  <MicOff className="h-3 w-3 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Chat</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={cn("flex flex-col", msg.sender === currentUser.name ? "items-end" : "items-start")}>
                    <div className={cn("max-w-xs rounded-lg px-3 py-2 text-sm", 
                      msg.sender === currentUser.name
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-900"
                    )}>
                      <p className="font-medium text-xs mb-1 opacity-75">
                        {msg.sender} • {msg.timestamp}
                      </p>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Type a message..."
                  className="flex-1 min-h-0 resize-none"
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                />
                <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim() || !peerRef.current?.connected}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant={isMuted ? "destructive" : "secondary"} 
              size="sm" 
              onClick={toggleMute}
              className="gap-2"
              disabled={callStatus !== 'connected'}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            
            <Button 
              variant={isVideoOff ? "destructive" : "secondary"} 
              size="sm" 
              onClick={toggleVideo}
              className="gap-2"
               disabled={callStatus !== 'connected'}
            >
              {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              {isVideoOff ? "Start Video" : "Stop Video"}
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="gap-2"
              disabled={callStatus !== 'connected'}
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            
            <Button variant="secondary" size="sm" className="gap-2" disabled={callStatus !== 'connected'}>
              <Monitor className="h-4 w-4" />
              Share Screen
            </Button>
            
            <Button variant="secondary" size="sm" disabled={callStatus !== 'connected'}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
             <Button 
              variant="secondary" 
              size="sm" 
              onClick={toggleFullScreen}
            >
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={leaveCall}
              className="gap-2 ml-4"
            >
              <PhoneOff className="h-4 w-4" />
              Leave
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Replacing the old component with the new one
export default VideoCallInterface;