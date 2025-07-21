'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Pin
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Mock user data
const getParticipantInfo = (role?: 'student' | 'counselor' | null) => {
    if (role === 'student') {
        return {
            currentUser: { name: "Adjoa Mensah", role: "Student", avatarUrl: "https://placehold.co/100x100.png", aiHint: "student photo" },
            peerUser: { name: "Dr. Nancy Darkoah", role: "Counselor", avatarUrl: "https://placehold.co/100x100.png", aiHint: "professional portrait" }
        }
    }
    return {
        currentUser: { name: "Dr. Nancy Darkoah", role: "Counselor", avatarUrl: "https://placehold.co/100x100.png", aiHint: "professional portrait" },
        peerUser: { name: "Adjoa Mensah", role: "Student", avatarUrl: "https://placehold.co/100x100.png", aiHint: "student photo" }
    }
}

export default function ZoomVideoCallInterface() {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'Dr. Nancy Darkoah', text: 'Welcome to our counseling session. How are you feeling today?', timestamp: '10:30 AM' },
    { sender: 'You', text: 'Thank you for asking. I\'ve been feeling a bit overwhelmed lately.', timestamp: '10:31 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  const [recordingStatus, setRecordingStatus] = useState(false);
  
  const myVideo = useRef(null);
  const userVideo = useRef(null);

  const { currentUser, peerUser } = getParticipantInfo('student');

  useEffect(() => {
    const timer = setTimeout(() => {
      setCallAccepted(true);
    }, 2000);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error('Failed to get media devices.', err);
      });
      
    return () => clearTimeout(timer);
  }, []);

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
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const message = { sender: 'You', text: newMessage.trim(), timestamp };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const leaveCall = () => {
    setCallAccepted(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
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
    <div className="relative h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", {
              'bg-green-500': connectionQuality === 'excellent',
              'bg-yellow-500': connectionQuality === 'good',
              'bg-red-500': connectionQuality === 'poor'
            })}></div>
            <span className="text-sm text-gray-300">
              {connectionQuality === 'excellent' ? 'Excellent connection' : 
               connectionQuality === 'good' ? 'Good connection' : 'Poor connection'}
            </span>
          </div>
          {recordingStatus && (
            <div className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Recording</span>
            </div>
          )}
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
        <div className={cn("flex-1 relative bg-black", {
          "mr-80": showChat,
          "mr-64": showParticipants && !showChat
        })}>
          {/* Speaker View */}
          <div className="absolute inset-0">
            {callAccepted ? (
              <div className="relative h-full w-full">
                <video 
                  playsInline 
                  ref={userVideo} 
                  autoPlay 
                  className="w-full h-full object-cover"
                />
                {/* Speaker Overlay */}
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

                {/* Pin Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white"
                >
                  <Pin className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="animate-pulse mb-4">
                    <Avatar className="h-32 w-32 mx-auto border-4 border-blue-500">
                      <AvatarImage src={peerUser.avatarUrl} alt={peerUser.name} />
                      <AvatarFallback className="text-4xl bg-gray-700">
                        {peerUser.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Connecting to {peerUser.name}...</h3>
                  <p className="text-gray-400">Please wait while we establish the connection</p>
                </div>
              </div>
            )}
          </div>

          {/* Self View (Picture-in-Picture) */}
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-gray-600 shadow-xl">
            <video 
              playsInline 
              muted 
              ref={myVideo} 
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
                <p className="text-white text-xs font-medium truncate">You</p>
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
                  <div key={index} className={cn("flex flex-col", msg.sender === 'You' ? "items-end" : "items-start")}>
                    <div className={cn("max-w-xs rounded-lg px-3 py-2 text-sm", 
                      msg.sender === 'You' 
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
                <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Participants Panel */}
        {showParticipants && !showChat && (
          <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Participants (2)</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowParticipants(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={peerUser.avatarUrl} alt={peerUser.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {peerUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{peerUser.name}</p>
                    <p className="text-xs text-gray-500">{peerUser.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mic className="h-4 w-4 text-green-600" />
                    <Video className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback className="bg-gray-600 text-white text-sm">
                      {currentUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{currentUser.name} (You)</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isMuted ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4 text-green-600" />
                    )}
                    {isVideoOff ? (
                      <VideoOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Video className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
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
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isMuted ? "Unmute" : "Mute"}
              <ChevronUp className="h-3 w-3" />
            </Button>
            
            <Button 
              variant={isVideoOff ? "destructive" : "secondary"} 
              size="sm" 
              onClick={toggleVideo}
              className="gap-2"
            >
              {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              {isVideoOff ? "Start Video" : "Stop Video"}
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Participants
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            
            <Button variant="secondary" size="sm" className="gap-2">
              <Monitor className="h-4 w-4" />
              Share Screen
            </Button>
            
            <Button variant="secondary" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            
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