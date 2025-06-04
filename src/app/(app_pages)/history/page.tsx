'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppSettings, ChatSession } from '@/contexts/AppSettingsContext';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const router = useRouter();
  const { setSessionToRestore } = useAppSettings();

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);      // Convert date strings back to Date objects
      const sessionsWithDates = parsed.map((session: ChatSession) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: { id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp: string | Date }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setSessions(sessionsWithDates.sort((a: ChatSession, b: ChatSession) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      ));
    }
  }, []);

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter(session => session.id !== sessionId);
    setSessions(updated);
    localStorage.setItem('chatSessions', JSON.stringify(updated));
  };

  const restoreSession = (session: ChatSession) => {
    setSessionToRestore(session);
    router.push('/chat');
  };

  const getSessionPreview = (session: ChatSession) => {
    const firstUserMessage = session.messages.find(msg => msg.role === 'user');
    return firstUserMessage?.content || 'No messages';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      setSessions([]);
      localStorage.removeItem('chatSessions');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Chat History</h1>
          <p className="text-muted-foreground">
            View and restore your previous conversations
          </p>
        </div>
        {sessions.length > 0 && (
          <Button variant="destructive" onClick={clearAllHistory}>
            Clear All History
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No chat history</h3>
          <p className="text-muted-foreground mb-4">
            Your conversations will appear here after you start chatting.
          </p>
          <Button onClick={() => router.push('/chat')}>
            Start Chatting
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">
                        {formatDate(session.timestamp)}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {session.mode.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.messages.length} messages
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {getSessionPreview(session)}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Model: {session.model.split('/').pop()}</span>
                      <span>Temp: {session.parameters.temperature}</span>
                      <span>Max tokens: {session.parameters.max_tokens}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => restoreSession(session)}
                      title="Restore session"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteSession(session.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
