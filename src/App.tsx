import { useState, useCallback, useEffect } from 'react';
import NeuralNetworkAnimation from './components/NeuralNetworkAnimation';
import ChatBot from './components/ChatBot';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import type { ChatSession, Message } from './components/types';
import './App.css';

function generateId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function App() {
  const { user, token } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch chats from backend when user logs in
  useEffect(() => {
    if (token) {
      fetch('http://localhost:3001/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSessions(data);
          if (data.length > 0 && !activeChatId) {
            setActiveChatId(data[0].id);
          }
        }
      })
      .catch(console.error);
    } else {
      setSessions([]);
      setActiveChatId(null);
    }
  }, [token]);

  const activeSession = sessions.find((s) => s.id === activeChatId) ?? null;

  // Create a new chat session
  const handleNewChat = useCallback(async () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    if (token) {
      try {
        await fetch('http://localhost:3001/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id: newSession.id, title: newSession.title })
        });
      } catch (e) {
        console.error(e);
      }
    }

    setSessions((prev) => [newSession, ...prev]);
    setActiveChatId(newSession.id);
  }, [token]);

  // Called from empty-state ChatBot when user submits first query
  const handleFirstSubmit = useCallback(async (query: string) => {
    const firstMsg: Message = { id: generateId(), role: 'user', content: query, timestamp: Date.now() };
    const title = query.slice(0, 40) + (query.length > 40 ? '…' : '');
    const newSession: ChatSession = {
      id: generateId(),
      title,
      messages: [firstMsg],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    if (token) {
      try {
        await fetch('http://localhost:3001/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id: newSession.id, title: newSession.title })
        });
        
        await fetch(`http://localhost:3001/api/chats/${newSession.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title, message: firstMsg })
        });
      } catch (e) {
        console.error(e);
      }
    }

    setSessions((prev) => [newSession, ...prev]);
    setActiveChatId(newSession.id);
  }, [token]);

  // Update messages for the active session
  const handleMessagesChange = useCallback(async (messages: Message[]) => {
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== activeChatId) return s;
        // Use first user message as title
        const firstUserMsg = messages.find((m) => m.role === 'user');
        const title = firstUserMsg
          ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '…' : '')
          : 'New Chat';
        
        // Find the newest message (the one that was just added)
        const newMessage = messages[messages.length - 1];
        
        if (token && newMessage && !newMessage.id) {
          newMessage.id = generateId();
          newMessage.timestamp = Date.now();
          // Sync with backend
          fetch(`http://localhost:3001/api/chats/${activeChatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, message: newMessage })
          }).catch(console.error);
        }
        
        return { ...s, messages, title, updatedAt: Date.now() };
      });
      return updated;
    });
  }, [activeChatId, token]);

  // Delete a session
  const handleDeleteChat = useCallback(async (id: string) => {
    if (token) {
      try {
        await fetch(`http://localhost:3001/api/chats/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error(e);
      }
    }

    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (id === activeChatId) {
        setActiveChatId(updated[0]?.id ?? null);
      }
      return updated;
    });
  }, [activeChatId, token]);

  return (
    <div className="app-layout">
      {/* Full-page background neural animation */}
      <NeuralNetworkAnimation />

      <Sidebar
        sessions={sessions}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <main className={`app-main ${sidebarOpen ? 'app-main--shifted' : ''}`}>
        <section className="chat-section">
          <ChatBot
            key={activeChatId ?? 'empty'}
            initialMessages={activeSession?.messages ?? []}
            onMessagesChange={activeChatId ? handleMessagesChange : undefined}
            onFirstSubmit={!activeChatId ? handleFirstSubmit : undefined}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
