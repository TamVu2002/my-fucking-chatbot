'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Eye,
  Edit,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  Crown,
  Globe,
  Lock,
  Copy,
  QrCode,
  Bell,
  BellOff,
  MousePointer,
  Pointer,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Types for collaboration features
interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'offline';
  cursor?: { x: number; y: number };
  isTyping?: boolean;
  joinedAt: Date;
  lastActive: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  ownerId: string;
  users: CollaborationUser[];
  isPublic: boolean;
  maxUsers: number;
  createdAt: Date;
  settings: {
    allowAnonymous: boolean;
    requireApproval: boolean;
    enableVoiceChat: boolean;
    enableVideoChat: boolean;
    enableCursorTracking: boolean;
  };
}

interface CollaborationActivity {
  id: string;
  userId: string;
  userName: string;
  action: 'joined' | 'left' | 'message_sent' | 'prompt_changed' | 'model_changed';
  details?: string;
  timestamp: Date;
}

interface RealTimeCollaborationProps {
  onMessageSend?: (message: string, collaborators: string[]) => void;
  onPromptChange?: (prompt: string, userId: string) => void;
  className?: string;
}

export default function RealTimeCollaboration({ 
  className = '' 
}: Pick<RealTimeCollaborationProps, 'className'>) {
  
  // State management
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState(true);
    // Real-time features
  const [isVoiceChatEnabled, setIsVoiceChatEnabled] = useState(false);
  const [isVideoChatEnabled, setIsVideoChatEnabled] = useState(false);
  const [isMuted] = useState(false);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; userId: string; userName: string }>>({});
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  // Refs for tracking
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize collaboration session
  const initializeSession = useCallback((sessionName?: string) => {
    const sessionId = `session-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    
    const newUser: CollaborationUser = {
      id: userId,
      name: `User ${Math.floor(Math.random() * 1000)}`,
      role: 'owner',
      status: 'online',
      joinedAt: new Date(),
      lastActive: new Date()
    };

    const newSession: CollaborationSession = {
      id: sessionId,
      name: sessionName || 'Untitled Session',
      ownerId: userId,
      users: [newUser],
      isPublic: false,
      maxUsers: 10,
      createdAt: new Date(),
      settings: {
        allowAnonymous: true,
        requireApproval: false,
        enableVoiceChat: false,
        enableVideoChat: false,
        enableCursorTracking: true
      }
    };

    setCurrentSession(newSession);
    setCurrentUser(newUser);
    setIsActive(true);
    
    // Generate invite link
    const link = `${window.location.origin}/collaborate/${sessionId}`;
    setInviteLink(link);
      // Note: WebSocket initialization would happen here in a real implementation
    console.log(`Would connect to collaboration session: ${sessionId}`);
    
    // Add initial activity
    if (currentUser) {
      const activity: CollaborationActivity = {
        id: `activity-${Date.now()}`,
        userId: userId,
        userName: newUser.name,
        action: 'joined',
        details: 'Started collaboration session',
        timestamp: new Date()
      };
        setActivities(prev => [activity, ...prev.slice(0, 49)]);
    }
  }, [currentUser]);
  // Add activity to the feed
  const addActivity = useCallback((action: CollaborationActivity['action'], details?: string) => {
    if (!currentUser) return;
    
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date()
    };
    
    setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50
  }, [currentUser]);

  // Handle invite link copy
  const copyInviteLink = useCallback(() => {
    navigator.clipboard.writeText(inviteLink);
    addActivity('message_sent', 'Copied invite link');
  }, [inviteLink, addActivity]);

  // Handle user role change
  const changeUserRole = useCallback((userId: string, newRole: CollaborationUser['role']) => {
    if (!currentSession || !currentUser || currentUser.role !== 'owner') return;
    
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      };
    });
    
    addActivity('message_sent', `Changed user role to ${newRole}`);
  }, [currentSession, currentUser, addActivity]);

  // End collaboration session
  const endSession = useCallback(() => {
    setIsActive(false);
    setCurrentSession(null);
    setCurrentUser(null);
    setActivities([]);
    setCursors({});
    setTypingUsers(new Set());
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Toggle voice chat
  const toggleVoiceChat = useCallback(() => {
    setIsVoiceChatEnabled(prev => !prev);
    addActivity('message_sent', `${isVoiceChatEnabled ? 'Disabled' : 'Enabled'} voice chat`);
  }, [isVoiceChatEnabled, addActivity]);

  // Toggle video chat
  const toggleVideoChat = useCallback(() => {
    setIsVideoChatEnabled(prev => !prev);
    addActivity('message_sent', `${isVideoChatEnabled ? 'Disabled' : 'Enabled'} video chat`);
  }, [isVideoChatEnabled, addActivity]);

  // Render user avatar
  const renderUserAvatar = (user: CollaborationUser, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base'
    };

    const statusColors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-500'
    };

    const roleIcons = {
      owner: <Crown className="w-3 h-3" />,
      editor: <Edit className="w-3 h-3" />,
      viewer: <Eye className="w-3 h-3" />
    };

    return (
      <div className="relative">        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium relative`}>
          {user.avatar ? (
            <Image 
              src={user.avatar} 
              alt={user.name} 
              width={40} 
              height={40} 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusColors[user.status]} rounded-full border-2 border-background`} />
        {user.role !== 'viewer' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center border">
            {roleIcons[user.role]}
          </div>
        )}
      </div>
    );
  };

  if (!isActive) {
    return (
      <div className={`collaboration-starter ${className}`}>
        <Button
          onClick={() => initializeSession()}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Users className="w-4 h-4" />
          Start Collaboration
        </Button>
      </div>
    );
  }

  return (
    <div className={`collaboration-panel ${className}`}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-background border border-border rounded-lg shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="font-medium">{currentSession?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {currentSession?.users.slice(0, 3).map(user => (
                  <div key={user.id} title={user.name}>
                    {renderUserAvatar(user, 'sm')}
                  </div>
                ))}
                {currentSession && currentSession.users.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    +{currentSession.users.length - 3}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice/Video controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceChat}
                className={isVoiceChatEnabled ? 'text-green-500' : ''}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVideoChat}
                className={isVideoChatEnabled ? 'text-green-500' : ''}
              >
                {isVideoChatEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={endSession}
                className="text-red-500 hover:text-red-600"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Collaboration Content */}
          <div className="p-4 space-y-4">
            {/* Invite Section */}
            <div className="flex items-center gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1 text-sm"
                placeholder="Invite link will appear here"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyInviteLink}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Generate QR code */}}
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>

            {/* Active Users */}
            <div>
              <h4 className="text-sm font-medium mb-2">Active Users ({currentSession?.users.length})</h4>
              <div className="space-y-2">
                {currentSession?.users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-2">
                      {renderUserAvatar(user)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user.name}</span>
                          {typingUsers.has(user.id) && (
                            <span className="text-xs text-muted-foreground italic">typing...</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                      </div>
                    </div>
                    
                    {currentUser?.role === 'owner' && user.id !== currentUser.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => changeUserRole(user.id, user.role === 'editor' ? 'viewer' : 'editor')}
                        >
                          {user.role === 'editor' ? <Eye className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="text-xs text-muted-foreground p-2 rounded bg-muted">
                    <span className="font-medium">{activity.userName}</span> {activity.details}
                    <span className="ml-2">{activity.timestamp.toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border pt-4"
              >
                <h4 className="text-sm font-medium mb-3">Collaboration Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public Session</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentSession(prev => prev ? { ...prev, isPublic: !prev.isPublic } : prev)}
                    >
                      {currentSession?.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cursor Tracking</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentSession(prev => prev ? { 
                        ...prev, 
                        settings: { ...prev.settings, enableCursorTracking: !prev.settings.enableCursorTracking }
                      } : prev)}
                    >
                      <MousePointer className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Max Users</span>
                    <Input
                      type="number"
                      value={currentSession?.maxUsers || 10}
                      onChange={(e) => setCurrentSession(prev => prev ? { 
                        ...prev, 
                        maxUsers: parseInt(e.target.value) 
                      } : prev)}
                      className="w-16 h-8"
                      min="2"
                      max="50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating cursors for other users */}
      {Object.entries(cursors).map(([id, cursor]) => (
        <motion.div
          key={id}
          className="fixed pointer-events-none z-50"
          style={{ left: cursor.x, top: cursor.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <Pointer className="w-4 h-4 text-blue-500" />
          <span className="ml-2 text-xs bg-blue-500 text-white px-1 rounded">
            {cursor.userName}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
