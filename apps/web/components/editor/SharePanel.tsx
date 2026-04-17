"use client";

import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiX, FiShield, FiBook, FiFileText } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

interface Collaborator {
  id: string;
  permission_level: 'viewer' | 'editor';
  users: {
    email: string;
  };
}

interface SharePanelProps {
  pageId: string | null;
  notebookId: string;
  ownerId?: string;
  onClose: () => void;
}

export default function SharePanel({ 
  pageId, 
  notebookId,
  ownerId, 
  onClose 
}: SharePanelProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'viewer' | 'editor'>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [shareMode, setShareMode] = useState<'page' | 'notebook'>('page');
  const [activeCollaborators, setActiveCollaborators] = useState<Collaborator[]>([]);
  
  const supabase = createClient();

  const fetchCollaborators = async () => {
    setActiveCollaborators([]); // Clear while loading
    if (shareMode === 'page' && pageId) {
      const { data } = await supabase
        .from('page_collaborators')
        .select('*, users:user_id(email)')
        .eq('page_id', pageId);
      if (data) setActiveCollaborators(data);
    } else if (shareMode === 'notebook') {
      const { data } = await supabase
        .from('notebook_collaborators')
        .select('*, users:user_id(email)')
        .eq('notebook_id', notebookId);
      if (data) setActiveCollaborators(data);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [shareMode, pageId, notebookId]);

  const handleInvite = async () => {
    if (!email) return;
    setIsLoading(true);
    
    try {
      const endpoint = shareMode === 'page' ? '/api/manage-page-share' : '/api/manage-notebook-share';
      const payload = shareMode === 'page' 
        ? { page_id: pageId, collaborator_email: email, permission_level: permission, owner_id: ownerId }
        : { notebook_id: notebookId, collaborator_email: email, permission_level: permission, owner_id: ownerId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setEmail('');
      fetchCollaborators(); 
    } catch (error: any) {
      alert(`Share failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      const endpoint = shareMode === 'page' ? '/api/manage-page-share' : '/api/manage-notebook-share';
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_id: shareId })
      });
      
      if (!response.ok) throw new Error("Failed to revoke access");
      fetchCollaborators();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l flex flex-col z-50 transform transition-transform duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <FiUserPlus className="text-blue-600" /> Share Options
        </h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
          <FiX size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4 pt-2">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            disabled={!pageId}
            onClick={() => setShareMode('page')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${!pageId ? 'opacity-40 cursor-not-allowed' : shareMode === 'page' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiFileText size={14} /> This Page
          </button>
          <button 
            onClick={() => setShareMode('notebook')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${shareMode === 'notebook' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiBook size={14} /> Full Workspace
          </button>
        </div>
      </div>
      
      <div className="px-6 flex-1 flex flex-col overflow-hidden">
        <div className={`border rounded-lg p-3 mb-6 ${shareMode === 'notebook' ? 'bg-purple-50 border-purple-100 text-purple-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
          <p className="text-xs leading-relaxed">
            {shareMode === 'notebook' ? (
              <><strong>Workspace Sharing:</strong> Collaborators will have access to all current and future pages in this notebook.</>
            ) : (
              <><strong>Page-Level Sharing:</strong> Only this specific page will be shared. The rest of your notebook remains completely private.</>
            )}
          </p>
        </div>

        {/* Invite Form */}
        <div className="space-y-3 mb-8 shrink-0">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Invite Collaborator</label>
          <input 
            type="email" 
            placeholder="Enter user's email address" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          
          <select 
            value={permission} 
            onChange={e => setPermission(e.target.value as 'viewer' | 'editor')}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="viewer">Viewer (Read-only access)</option>
            <option value="editor">Editor (Can edit text/pages)</option>
          </select>
          
          <button 
            onClick={handleInvite} 
            disabled={isLoading || !email} 
            className="w-full bg-[#1c1c21] hover:bg-black text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Inviting...' : 'Send Invite'}
          </button>
        </div>

        {/* Active Collaborators List */}
        <div className="flex flex-col flex-1 min-h-0 pb-6">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
            Active Collaborators ({activeCollaborators.length})
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {activeCollaborators.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center mt-4">
                This {shareMode} is currently private.
              </p>
            ) : (
              activeCollaborators.map(collab => (
                <div key={collab.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="flex flex-col truncate pr-2">
                    <span className="text-sm font-medium text-gray-800 truncate" title={collab.users.email}>
                      {collab.users.email}
                    </span>
                    <span className={`text-[10px] uppercase font-bold flex items-center gap-1 mt-0.5 ${collab.permission_level === 'editor' ? 'text-blue-600' : 'text-gray-500'}`}>
                      <FiShield size={10} /> {collab.permission_level}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRevoke(collab.id)} 
                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded transition-colors shrink-0"
                  >
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
