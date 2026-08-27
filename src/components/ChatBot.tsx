// src/components/ChatBot.tsx
import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import './ChatBot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const response = await axios.post('/api/query', { query: userMsg.content });
      const assistantMsg: Message = { role: 'assistant', content: response.data.answer };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = { role: 'assistant', content: 'Error: unable to fetch response.' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="chatbot-container">
      <header className="chat-header">
        <div className="chat-header-dot" />
        <h1 className="chat-title">ResearchOS</h1>
        <p className="chat-subtitle">Deep Research Agent</p>
      </header>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>Ask me anything. I'll research it deeply.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant thinking">
            <span /><span /><span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          placeholder="Ask a deep research question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="chat-input"
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()} className="send-button">
          {loading ? '...' : '↑'}
        </button>
      </form>
    </div>
  );
}
