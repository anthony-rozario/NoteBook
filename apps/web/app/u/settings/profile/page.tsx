"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { FiSave, FiCheckCircle, FiAlertCircle, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileSettingsPage() {
  const { user, profile } = useUser();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (profile?.name) setFullName(profile.name);
    else if (user?.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // 1. Update the public users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ name: fullName })
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      // 2. Update Auth metadata as well for redundancy
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiUser className="text-blue-500" /> Public Profile
        </h2>
        
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-2xl shadow-blue-500/20">
                {fullName.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Change</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Display Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-gray-900" 
                  placeholder="Your full name"
                />
                <p className="mt-2 text-sm text-gray-400">This is how you'll appear to your collaborators.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                <div className="w-full bg-gray-100/50 border border-transparent rounded-2xl px-5 py-4 text-gray-400 cursor-not-allowed font-medium">
                  {user?.email}
                </div>
                <p className="mt-2 text-sm text-gray-400">Email addresses are currently locked to your account.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {saveStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-600 font-semibold"
                >
                  <FiCheckCircle /> Changes saved successfully!
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-600 font-semibold"
                >
                  <FiAlertCircle /> Something went wrong.
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                isSaving ? 'bg-gray-400 cursor-wait' : 'bg-[#1c1c21] hover:bg-black shadow-black/10'
              }`}
            >
              <FiSave /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
