"use client";

import React, { useState } from 'react';
import { FiUserPlus, FiX, FiShield } from 'react-icons/fi';

interface Collaborator {
  id: string;
  permission_level: 'viewer' | 'editor';
  users: {
    email: string;
  };
}

interface PageSharePanelProps {
  pageId: string;
  ownerId?: string;
  activeCollaborators: Collaborator[];
  onClose: () => void;
  refreshData: () => void;
}

export default function PageSharePanel({ 
  pageId, 
  ownerId, 
  activeCollaborators, 
  onClose, 
  refreshData 
}: PageSharePanelProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'viewer' | 'editor'>('viewer');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/manage-page-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          page_id: pageId, 
          collaborator_email: email, 
          permission_level: permission, 
          owner_id: ownerId 
        })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setEmail('');
      refreshData(); // Refresh the list of active collaborators instantly
    } catch (error: any) {
      alert(`Share failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      const response = await fetch('/api/manage-page-share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_id: shareId })
      });
      
      if (!response.ok) throw new Error("Failed to revoke access");
      refreshData(); // Instantly remove them from the UI list
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l p-6 z-50 flex flex-col transform transition-transform duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <FiUserPlus className="text-blue-600" /> Share Page
        </h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
          <FiX size={20} />
        </button>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Page-Level Sharing:</strong> Only this specific page will be shared. The rest of your notebook remains completely private.
        </p>
      </div>

      {/* Invite Form */}
      <div className="space-y-3 mb-8">
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
          <option value="editor">Editor (Can edit text)</option>
        </select>
        
        <button 
          onClick={handleInvite} 
          disabled={isLoading || !email} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Inviting...' : 'Send Invite'}
        </button>
      </div>

      {/* Active Collaborators List */}
      <div className="flex flex-col flex-1 min-h-0">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
          Active Collaborators
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {activeCollaborators.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center mt-4">This page is currently private.</p>
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
  );
}