"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { 
  FiSend, FiPlus, FiMic, FiZap, FiImage, FiSearch, FiFileText, FiChevronUp, FiCopy, FiTrash2,
  FiStar 
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AIHubPage() {
  const { profile, user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notebooks, setNotebooks] = useState<{id: string; title: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const displayFirstName = profile?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    fetchNotebooks();
    fetchMessages();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchNotebooks = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('notebooks')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotebooks(data || []);
  };

  const fetchMessages = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);
      
    if (data && data.length > 0) {
      setMessages(data.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      })));
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    // Save user message to database
    if (user?.id) {
      supabase.from('ai_chats').insert({
        user_id: user.id,
        role: 'user',
        content: text
      }).then();
    }

    try {
      // Build history to send (exclude the message we just added)
      const historyToSend = messages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, history: historyToSend }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI request failed');

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant message to database
      if (user?.id) {
        supabase.from('ai_chats').insert({
          user_id: user.id,
          role: 'assistant',
          content: data.response
        }).then();
      }
    } catch (error) {
      const errText = (error as Error).message;
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errText.includes('API key') || errText.includes('auth')
          ? `❌ API Key error: ${errText}\n\nPlease check your \`GROQ_API_KEY\` in \`.env.local\`.`
          : `❌ Error: ${errText}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickPrompts = [
    { icon: FiFileText, label: 'Summarize my notebooks', prompt: `Summarize my recent notebooks: ${notebooks.slice(0,3).map(n => n.title).join(', ')}` },
    { icon: FiZap, label: 'Deep research', prompt: 'Help me research advanced DBMS concepts for MCA' },
    { icon: FiImage, label: 'PDF tips', prompt: 'Best way to extract and organize text from lecture PDFs' },
    { icon: FiSearch, label: 'Study strategy', prompt: 'Create a study plan for my upcoming exams based on my notebooks' },
  ];

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Shared input bar component
  const InputBar = () => (
    <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4 shrink-0 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end gap-3 bg-white rounded-3xl p-3 sm:p-4 shadow-lg border border-gray-200 focus-within:border-blue-300 focus-within:shadow-blue-50 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Message NoteBook AI..."
            className="flex-1 bg-transparent resize-none outline-none text-base placeholder-gray-400 py-1"
            disabled={loading}
            autoFocus
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1c1c21] text-white rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shrink-0"
          >
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FiSend size={16} />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 justify-center opacity-70">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => { setInput(p.prompt); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full font-medium border transition-colors whitespace-nowrap"
            >
              <p.icon size={12} />
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-gray-50/30 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <BsStars className="text-blue-500" />
            NoteBook AI
          </div>
          <span className="text-sm font-semibold text-gray-500 tracking-wide">AI Hub</span>
          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1c1c21] hover:bg-black px-4 py-2 rounded-full shadow-sm">
            <FiStar className="text-amber-300" />
            Upgrade
          </button>
        </div>

        {/* Empty Chat Prompt */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
            <BsStars className="text-blue-500 text-3xl sm:text-4xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">AI Hub</h1>
          <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-md">
            Hello, {displayFirstName}! Ask anything about your notes, PDFs, or studies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full mb-8">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p.prompt)}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 text-left"
              >
                <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                  <p.icon size={16} />
                </div>
                <span className="font-medium text-gray-800 text-sm">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input bar is shown even in empty state */}
        <InputBar />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-gray-50/30 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <BsStars className="text-blue-500 text-xl" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">NoteBook AI</h1>
            <p className="text-xs text-gray-500">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          title="Clear chat"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100 transition-all"
        >
          <FiTrash2 size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shrink-0 mr-3 mt-1">
                <BsStars className="text-blue-500 text-sm" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'max-w-[80%]' : ''}`}>
              <div className={`p-4 rounded-3xl shadow-sm ${msg.role === 'user' ? 'bg-[#1c1c21] text-white rounded-br-md' : 'bg-white border border-gray-100 rounded-bl-md'}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
              <div className={`flex items-center gap-2 mt-1.5 px-1 text-xs text-gray-400 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <button onClick={() => copyMessage(msg.content)} title="Copy" className="hover:text-gray-600 transition-colors">
                  <FiCopy size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shrink-0 mr-3">
              <BsStars className="text-blue-500 text-sm" />
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-bl-md shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <InputBar />
    </div>
  );
}
