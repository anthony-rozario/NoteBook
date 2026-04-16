"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@/context/UserContext';
import { 
  FiUsers, FiFileText, FiShare2, FiMoreVertical, 
  FiExternalLink, FiUserPlus, FiLock, FiSearch, FiPlus
} from 'react-icons/fi';

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SharedItem = {
  id: string;
  notebookId: string;
  title: string;
  sharedBy: string;
  role: 'viewer' | 'editor';
  time: string;
};

type SharedByMeItem = {
  id: string;
  notebookId: string;
  title: string;
  isPublic: boolean;
  collaborators: { id: string; name: string }[];
};

type Friend = {
  id: string;
  name: string;
  email: string;
};

// UI Helper Functions
const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const getColorClass = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-red-100 text-red-700 border-red-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
};

export default function CollaborationPage() {
  const { user } = useUser();
  const [sharedWithMe, setSharedWithMe] = useState<SharedItem[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedByMeItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/collaboration/data', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const { sharedWithMe: swm, sharedByMe: sbm, friends: frs } = await res.json();
      setSharedWithMe(swm || []);
      setSharedByMe(sbm || []);
      setFriends(frs || []);
    } catch (error) {
      console.error("Error fetching collaboration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(f => 
    (f.name && f.name.toLowerCase().includes(search.toLowerCase())) || 
    (f.email && f.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleShareNotebook = () => {
    alert('Navigate to a Notebook to share a specific page!');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f3f2f1]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-8 md:p-12 z-10 relative bg-[#f3f2f1]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1c1c21] tracking-tight mb-2">
            Collaboration Hub
          </h1>
          <p className="text-gray-500 font-medium">
            {friends.length} friends • {sharedWithMe.length + sharedByMe.length} shared pages
          </p>
        </div>
        <button onClick={handleShareNotebook} className="flex items-center gap-2 bg-[#1c1c21] hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
          <FiShare2 size={18} /> Share Page
        </button>
      </div>

      <div className="flex border-b border-gray-300 mb-8">
        <button className="pb-4 px-1 font-semibold text-[#1c1c21] border-b-2 border-blue-600">Shared Pages</button>
      </div>

      {/* 2-Column Grid for Shared */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Shared with me */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1c1c21] flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FiUsers size={20} />
              </div>
              Shared with me ({sharedWithMe.length})
            </h2>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {sharedWithMe.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No shares yet. Ask peers for access!</p>
            ) : (
              sharedWithMe.map((item) => (
                <Link key={item.id} href={`/u/notebooks/${item.notebookId}?page=${item.id}`} className="flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border ${getColorClass(item.sharedBy)}`}>
                      {getInitials(item.sharedBy)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1c1c21] text-base group-hover:text-blue-600 transition-colors">{item.title}</span>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                        <span>{item.sharedBy}</span>
                        <span>•</span>
                        <span className={`uppercase tracking-wider text-[10px] ${item.role === 'editor' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                          {item.role}
                        </span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                  <FiExternalLink className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" size={18} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Shared by me */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1c1c21] flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <FiFileText size={20} />
              </div>
              Shared by me ({sharedByMe.length})
            </h2>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {sharedByMe.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">You haven't shared any pages yet.</p>
            ) : (
              sharedByMe.map((item) => (
                <Link key={item.id} href={`/u/notebooks/${item.notebookId}?page=${item.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md rounded-xl transition-all group gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1c1c21] text-base group-hover:text-purple-600 flex items-center gap-2 transition-colors">
                      {item.title}
                      {!item.isPublic && <FiLock className="text-gray-400" size={14} />}
                    </span>
                    <span className="text-xs font-medium text-gray-500 mt-1">{item.collaborators.length} collaborators</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {item.collaborators.slice(0,3).map((c, i) => (
                        <div key={i} title={c.name} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${getColorClass(c.name)}`}>
                          {getInitials(c.name)}
                        </div>
                      ))}
                      {item.collaborators.length > 3 && (
                        <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                          +{item.collaborators.length - 3}
                        </div>
                      )}
                    </div>
                    <FiMoreVertical className="text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Friends Section */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1c1c21] flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <FiUsers size={20} />
            </div>
            Active Peers ({filteredFriends.length})
          </h2>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-[#f3f2f1] px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <FiSearch size={16} className="text-gray-400" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search peers..."
                className="bg-transparent outline-none w-32 max-w-xs"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-4 p-4 border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded-xl transition-all cursor-default group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border ${getColorClass(friend.name || friend.email)}`}>
                {getInitials(friend.name || friend.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1c1c21] text-sm truncate">{friend.name || 'Unnamed Peer'}</p>
                <p className="text-xs font-medium text-gray-500 truncate">{friend.email}</p>
              </div>
            </div>
          ))}
          {filteredFriends.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <FiUsers size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">No active peers found in your network.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}