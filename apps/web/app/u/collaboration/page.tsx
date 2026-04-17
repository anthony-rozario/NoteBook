"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';
import { 
  FiUsers, FiFileText, FiShare2, FiMoreVertical, 
  FiExternalLink, FiUserPlus, FiLock, FiSearch, FiPlus, FiBook, FiX, FiShield
} from 'react-icons/fi';

const supabase = createClient();

type SharedItem = {
  id: string;
  notebookId: string;
  pageId: string | null;
  type: 'notebook' | 'page';
  title: string;
  sharedBy: string;
  role: 'viewer' | 'editor';
  time: string;
  path: string;
  initials: string;
  color: string;
};

type SharedByMeItem = {
  id: string;
  notebookId: string;
  pageId: string | null;
  type: 'notebook' | 'page';
  title: string;
  isPublic: boolean;
  path: string;
  collaborators: { initials: string; color: string }[];
};

type Friend = {
  id: string;
  name: string;
  email: string;
  initials: string;
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
  const [myNotebooks, setMyNotebooks] = useState<{id: string; title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Share Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNotebook, setInviteNotebook] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer'|'editor'>('viewer');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [collabRes, nbRes] = await Promise.all([
        fetch('/api/collaboration/data', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
        supabase.from('notebooks').select('id, title').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);
      
      if (collabRes.ok) {
        const { sharedWithMe: swm, sharedByMe: sbm, friends: frs } = await collabRes.json();
        setSharedWithMe(swm || []);
        setSharedByMe(sbm || []);
        setFriends(frs || []);
      }

      if (nbRes.data) {
        setMyNotebooks(nbRes.data);
        if (nbRes.data.length > 0) setInviteNotebook(nbRes.data[0]?.id || '');
      }
    } catch (error) {
      console.error("Error fetching collaboration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareSubmit = async () => {
    if (!inviteEmail || !inviteNotebook || !user) return;
    setInviting(true);
    
    try {
      const res = await fetch('/api/manage-notebook-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebook_id: inviteNotebook,
          collaborator_email: inviteEmail,
          permission_level: inviteRole,
          owner_id: user?.id
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setInviteEmail('');
      setIsModalOpen(false);
      fetchData(); // refresh list
    } catch (error: any) {
      alert(`Invite failed: ${error.message}`);
    } finally {
      setInviting(false);
    }
  };

  const filteredFriends = friends.filter(f => 
    (f.name && f.name.toLowerCase().includes(search.toLowerCase())) || 
    (f.email && f.email.toLowerCase().includes(search.toLowerCase()))
  );

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
            {friends.length} active peers • {sharedWithMe.length + sharedByMe.length} shared items
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#1c1c21] hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
          <FiUserPlus size={18} /> Invite Peer
        </button>
      </div>

      <div className="flex border-b border-gray-300 mb-8">
        <button className="pb-4 px-1 font-semibold text-[#1c1c21] border-b-2 border-blue-600">Shared Items</button>
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
                <Link key={item.id + item.type} href={item.path} className="flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border ${getColorClass(item.sharedBy)}`}>
                      {item.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1c1c21] text-base group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        {item.type === 'notebook' ? <FiBook className="text-gray-400" /> : <FiFileText className="text-gray-400" />}
                        {item.title}
                      </span>
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
                <FiShare2 size={20} />
              </div>
              Shared by me ({sharedByMe.length})
            </h2>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {sharedByMe.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">You haven't shared any items yet.</p>
            ) : (
              sharedByMe.map((item, idx) => (
                <Link key={item.id + idx} href={item.path} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md rounded-xl transition-all group gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1c1c21] text-base group-hover:text-purple-600 flex items-center gap-2 transition-colors">
                      {item.type === 'notebook' ? <FiBook className="text-gray-400" /> : <FiFileText className="text-gray-400" />}
                      {item.title}
                      {!item.isPublic && <FiLock className="text-gray-400" size={14} />}
                    </span>
                    <span className="text-xs font-medium text-gray-500 mt-1">{item.collaborators.length} collaborators</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {item.collaborators.slice(0,3).map((c: any, i: number) => (
                        <div key={i} className="group/avatar relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm bg-gray-100 text-gray-700`}>
                            {c.initials}
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-gray-900 text-white p-3 rounded-xl shadow-xl opacity-0 scale-95 group-hover/avatar:opacity-100 group-hover/avatar:scale-100 transition-all pointer-events-none z-50">
                            <p className="font-bold text-sm truncate">{c.name}</p>
                            <p className="text-xs text-gray-300 truncate">{c.email}</p>
                            <span className={`inline-block mt-2 uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded-full ${c.role === 'editor' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                              {c.role}
                            </span>
                          </div>
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
                {friend.initials}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-bold text-[#1c1c21] text-sm truncate">{friend.name}</p>
                <p className="text-xs font-medium text-gray-500 truncate">{friend.email}</p>
              </div>
              <button 
                onClick={() => {
                  setInviteEmail(friend.email);
                  setIsModalOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
              >
                Invite
              </button>
            </div>
          ))}
          {filteredFriends.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <FiUsers size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">No active peers found. Invite someone to a Workspace!</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1c1c21] flex items-center gap-2">
                <FiUserPlus className="text-blue-600" /> Invite to Workspace
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notebook to Share</label>
                <select 
                  value={inviteNotebook}
                  onChange={e => setInviteNotebook(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  {myNotebooks.length === 0 ? (
                    <option value="">No notebooks available</option>
                  ) : (
                    myNotebooks.map(nb => <option key={nb.id} value={nb.id}>{nb.title}</option>)
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Peer Email</label>
                <input 
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="Enter their email address"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Access Level</label>
                <select 
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as 'viewer'|'editor')}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="editor">Editor (Can edit)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleShareSubmit}
              disabled={inviting || !inviteEmail || !inviteNotebook}
              className="w-full bg-[#1c1c21] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {inviting ? 'Sending Invite...' : <>Send Invite <FiShare2 /></>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}