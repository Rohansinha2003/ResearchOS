// src/components/ChatBot.tsx
import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import type { Message } from './types';
import './ChatBot.css';

// Extend Window for cross-browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface ChatBotProps {
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  onFirstSubmit?: (query: string) => void;
}

export default function ChatBot({ initialMessages = [], onMessagesChange, onFirstSubmit }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasMessages = messages.length > 0;

  // Notify parent whenever messages change
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fetch if mounted with a pending user message (from onFirstSubmit)
  useEffect(() => {
    const last = initialMessages[initialMessages.length - 1];
    if (last?.role === 'user') {
      fetchAnswer(last.content);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Voice search ──────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice search is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  // ── Core API fetch ────────────────────────────────
  const fetchAnswer = async (query: string) => {
    setLoading(true);
    setTimeout(scrollToBottom, 50);
    try {
      const response = await axios.post('/api/query', { query });
      const assistantMsg: Message = { role: 'assistant', content: response.data.answer };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      let errorText = 'Error: unable to fetch response.';
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorText = err.response.data.error;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: errorText }]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // If no active session yet, delegate to parent to create one with this query
    if (onFirstSubmit) {
      onFirstSubmit(input.trim());
      return;
    }
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    await fetchAnswer(userMsg.content);
  };

  // ── Centered search bar (empty state) ────────────
  if (!hasMessages) {
    return (
      <div className="chatbot-centered">
        <div className="chatbot-hero">
          <div className="chat-header-dot" />
          <h1 className="chat-title">ResearchOS</h1>
          <p className="chat-subtitle">Deep Research Agent</p>
        </div>

        {/* Width-constrained wrapper — this is what keeps everything aligned */}
        <div className="search-bar-wrapper">
          <form onSubmit={handleSubmit} className="chat-input-form chat-input-form--hero">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Ask a deep research question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="chat-input"
                autoFocus
              />
              <button
                type="button"
                onClick={startListening}
                className={`mic-button ${listening ? 'mic-button--active' : ''}`}
                title={listening ? 'Stop listening' : 'Voice search'}
              >
                {listening ? '⏹' : '🎙'}
              </button>
            </div>
            <button type="submit" disabled={loading || !input.trim()} className="send-button">
              {loading ? '…' : '↑'}
            </button>
          </form>

          {listening && (
            <div className="voice-indicator">
              <span className="voice-dot" /><span className="voice-dot" /><span className="voice-dot" />
              <span className="voice-label">Listening…</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Active chat ───────────────────────────────────
  return (
    <div className="chatbot-container">
      <div className="chat-messages">
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
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask a follow-up question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="chat-input"
            autoFocus
          />
          <button
            type="button"
            onClick={startListening}
            className={`mic-button ${listening ? 'mic-button--active' : ''}`}
            title={listening ? 'Stop listening' : 'Voice search'}
          >
            {listening ? '⏹' : '🎙'}
          </button>
        </div>
        <button type="submit" disabled={loading || !input.trim()} className="send-button">
          {loading ? '...' : '↑'}
        </button>
        {listening && (
          <div className="voice-indicator voice-indicator--inline">
            <span className="voice-dot" /><span className="voice-dot" /><span className="voice-dot" />
            <span className="voice-label">Listening…</span>
          </div>
        )}
      </form>
    </div>
  );
}
