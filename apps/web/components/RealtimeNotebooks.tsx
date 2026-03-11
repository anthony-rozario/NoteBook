// apps/web/components/RealtimeNotebooks.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { FiFileText, FiClock } from 'react-icons/fi';
import { useUser } from '@/context/UserContext'; // 1. Import your context!

// Helper function to format dates
function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

// 2. Remove the { userId } prop entirely
export default function RealtimeNotebooks() {
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  // 3. Grab the user instantly from memory
  const { user, isLoading: userLoading } = useUser(); 

  // Pass the ID as an argument so the Realtime subscription always uses the correct one
  const fetchNotebooks = async (currentUserId: string) => {
    const { data } = await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(4);
      
    if (data) setNotebooks(data);
    setLoading(false);
  };

  useEffect(() => {
    // 4. Wait until the user context has finished loading
    if (userLoading || !user?.id) return;

    // Run initial fetch
    fetchNotebooks(user.id);

    // Listen for database changes in real-time using the user's ID
    const channel = supabase
      .channel('realtime-notebooks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notebooks', filter: `user_id=eq.${user.id}` },
        () => {
          // Silently update the UI when the database changes
          fetchNotebooks(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, userLoading]); // Depend on the context state

  // Show skeleton if either the user context OR the notebooks are still loading
  if (loading || userLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="animate-pulse h-48 bg-gray-100 rounded-2xl w-full border border-gray-200"></div>
        <div className="animate-pulse h-48 bg-gray-100 rounded-2xl w-full border border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {notebooks && notebooks.length > 0 ? (
        notebooks.map((notebook) => (
          <Link href={`/u/notebooks/${notebook.id}`} key={notebook.id} className="group flex flex-col p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FiFileText size={20} />
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg mb-1">{notebook.title}</h3>
            <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase mb-2">
              {notebook.category || 'GENERAL'}
            </span>
            
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
              {notebook.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-auto">
              <FiClock size={14} />
              <span>Updated {getRelativeTime(notebook.created_at)}</span>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-2 p-10 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <FiFileText size={24} />
          </div>
          <p className="text-gray-900 font-semibold">No notebooks yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first one to get started!</p>
        </div>
      )}
    </div>
  );
}