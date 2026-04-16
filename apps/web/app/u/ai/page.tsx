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
    // Load recent notebooks for context
    fetchNotebooks();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchNotebooks = async () => {
    const { data } = await supabase
      .from('notebooks')
      .select('id, title')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotebooks(data || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const { response: aiResponse } = await response.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}. Check your GROQ_API_KEY.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickPrompts = [
    { icon: FiFileText, label: 'Summarize my notebooks', prompt: `Summarize my recent notebooks: ${notebooks.slice(0,3).map(n => n.title).join(', ')}` },
    { icon: FiZap, label: 'Deep research', prompt: 'Help me research advanced DBMS concepts for MCA' },
    { icon: FiImage, label: 'PDF tips', prompt: 'Best way to extract and organize text from KIIT lecture PDFs' },
    { icon: FiSearch, label: 'Find notes', prompt: 'Search my notes for database normalization examples' },
  ];

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Visual feedback (toast could be added)
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-gray-50/30 overflow-hidden relative">
        {/* Keep original header */}
        <div className="flex items-center justify-between px-8 py-6 shrink-0">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <BsStars className="text-blue-500" />
            NoteBook AI v1.0
            <FiChevronUp className="text-gray-400 ml-1" />
          </button>
          <span className="text-sm font-semibold text-gray-500 tracking-wide">AI Hub</span>
          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1c1c21] hover:bg-black px-4 py-2 rounded-full shadow-sm">
            <FiStar className="text-amber-300" />
            Upgrade
          </button>
        </div>

        {/* Empty Chat Prompt */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mb-6">
            <BsStars className="text-blue-500 text-3xl" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">AI Hub Ready</h1>
          <p className="text-lg text-gray-500 mb-8 max-w-md">Ask anything about your notes, PDFs, or studies</p>
          <div className="grid grid-cols-2 gap-4 max-w-md w-full">
            {quickPrompts.slice(0,2).map((p, i) => (
              <button key={i} onClick={() => setInput(p.prompt)} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                <p.icon size={20} />
                <span className="font-medium text-gray-900">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-gray-50/30 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <BsStars className="text-blue-500 text-xl" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">NoteBook AI</h1>
            <p className="text-sm text-gray-500">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FiTrash2 className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer" onClick={() => setMessages([])} title="Clear chat" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-3xl shadow-sm ${msg.role === 'user' ? 'bg-[#1c1c21] text-white' : 'bg-white border'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20 text-xs opacity-80">
                <span>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <FiCopy className="cursor-pointer hover:scale-110" size={14} onClick={() => copyMessage(msg.content)} title="Copy" />
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border p-4 rounded-3xl shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-8 pb-8 pt-4 shrink-0 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 bg-white rounded-3xl p-4 shadow-lg border border-gray-200">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Message NoteBook AI..."
              className="flex-1 bg-transparent resize-none outline-none text-base placeholder-gray-400 py-1"
              disabled={loading}
            />
            <FiPlus className="text-gray-400 flex-shrink-0" size={20} />
            <FiMic className="text-gray-400 flex-shrink-0" size={20} />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-[#1c1c21] text-white rounded-2xl flex items-center justify-center hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <FiSend size={18} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center opacity-70">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setInput(p.prompt)}
                className="flex items-center gap-2 px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-full font-medium border transition-colors whitespace-nowrap"
              >
                <p.icon size={14} />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
