"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiSearch, FiBook, FiGrid, FiClock, FiPlus, FiLogOut, FiHome, FiX, FiUser, FiSettings
} from 'react-icons/fi';
import { RiGeminiFill } from 'react-icons/ri';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import CreateNotebookButton from '@/components/CreateNotebookButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, profile } = useUser();

  const displayFullName = profile?.name || user?.user_metadata?.full_name || 'Anthony Prakash Rozario';
  const displayEmail = user?.email || '2470064@kiit.ac.in';

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Keyboard shortcut for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    router.push('/'); 
  };

  // Nav Items can now be links OR trigger actions
  const navItems = [
    { icon: FiHome, path: '/u', label: 'Home' },
    { icon: FiSearch, action: () => setIsSearchOpen(true), label: 'Search' },
    { icon: FiBook, path: '/u/notebooks', label: 'Notebooks' },
    { icon: FiGrid, path: '/u/collaboration', label: 'Collaboration' },
    { icon: RiGeminiFill, path: '/u/ai', label: 'AI Hub' },
  ];

  return (
    // Outer Container: Flex column on mobile, row on desktop
    <div className="min-h-screen bg-[#b4c7f3] flex flex-col md:flex-row h-[100dvh] p-0 md:p-3 sm:p-5 font-sans overflow-hidden relative selection:bg-blue-200">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-70">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-100/60 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/60 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] right-[30%] w-[400px] h-[400px] bg-purple-200/50 rounded-full blur-[100px]"></div>
      </div>

      {/* --- MOBILE TOP HEADER (Hidden on Desktop) --- */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1c1c21] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-[#1c1c21] tracking-tight">NoteBook</span>
        </div>
        <button 
          onClick={() => setIsProfileOpen(true)} 
          className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-blue-200"
        >
          {displayFullName.substring(0, 2).toUpperCase()}
        </button>
      </header>

      {/* --- DESKTOP SIDEBAR & MOBILE BOTTOM NAV --- */}
      <aside className="
        fixed bottom-0 left-0 right-0 h-[4.5rem] bg-white/90 backdrop-blur-xl border-t border-white/50 flex flex-row items-center justify-around px-2 z-40 pb-safe
        md:static md:w-20 md:h-auto md:bg-transparent md:border-none md:flex-col md:justify-start md:py-4 md:z-10 md:gap-8 shrink-0
      ">
        
        {/* Create Button (Desktop Only - Mobile uses a FAB below) */}
        <CreateNotebookButton className="hidden md:flex" />

        {/* Navigation Icons */}
        <div className="flex flex-row md:flex-col w-full md:w-auto justify-around md:justify-start gap-0 md:gap-6 text-gray-500 md:mt-4">
          {navItems.map((item, idx) => {
            const isActive = item.path ? (pathname === item.path || (item.path !== '/u' && pathname.startsWith(`${item.path}/`))) : false;
            
            const buttonContent = (
              <button 
                onClick={item.action} 
                className={`w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all duration-200 ${isActive ? 'bg-white shadow-sm text-blue-600' : 'hover:bg-white/50 hover:text-gray-900'}`}
                title={item.label}
              >
                <item.icon className="w-[22px] h-[22px] md:w-5 md:h-5" strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );

            return item.path ? (
              <Link key={idx} href={item.path} className="flex items-center justify-center">{buttonContent}</Link>
            ) : (
              <div key={idx} className="flex items-center justify-center">{buttonContent}</div>
            );
          })}
        </div>

        {/* Bottom Logo opens Profile (Desktop Only) */}
        <div className="hidden md:flex mt-auto flex-col gap-4 items-center">
          <button onClick={handleLogOut} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white/50 rounded-full transition-all">
            <FiLogOut size={18} />
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 bg-[#1c1c21] rounded-[14px] flex items-center justify-center shadow-md hover:rotate-0 rotate-3 transition-transform"
          >
            <span className="text-white font-bold text-lg">N</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE FLOATING ACTION BUTTON (FAB) --- */}
      <button 
        onClick={() => setIsCreateOpen(true)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[#1c1c21] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] z-30 hover:scale-105 active:scale-95 transition-transform"
      >
        <FiPlus size={24} />
      </button>

      {/* --- MAIN APP CANVAS --- */}
      {/* Notice the adjustments for border-radius and margin-bottom to accommodate the mobile layout */}
      <main className="flex-1 bg-white/95 backdrop-blur-3xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_-8px_40px_rgba(0,0,0,0.03)] md:shadow-[0_8px_40px_rgba(0,0,0,0.03)] border-t md:border border-white flex flex-col overflow-hidden relative z-10 md:ml-2 mb-[4.5rem] md:mb-0">
        {children}
      </main>

      {/* --- GLOBAL MODALS --- */}
      <AnimatePresence>
        
        {/* 1. GLOBAL SEARCH MODAL */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-32 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
              <div className="flex items-center px-4 md:px-6 py-4 border-b border-gray-100">
                <FiSearch size={24} className="text-blue-500 mr-3 md:mr-4 shrink-0" />
                <input autoFocus type="text" placeholder="Search notebooks, pages..." className="flex-1 bg-transparent text-base md:text-lg text-gray-800 placeholder-gray-400 outline-none w-full" onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)} />
                <span className="hidden md:inline-block text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md ml-2 shrink-0">ESC</span>
              </div>
              <div className="p-6 bg-gray-50/50 min-h-[200px] flex flex-col items-center justify-center text-gray-400 text-sm md:text-base text-center">
                <p>Start typing to search your workspace.</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. CREATE NOTEBOOK MODAL */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }} 
              className="relative w-full md:max-w-md bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 p-6 md:p-8"
            >
              {/* Mobile handle indicator */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#1c1c21]">New Notebook</h2>
                <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-50 p-2 rounded-full hidden md:block"><FiX size={20}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input type="text" autoFocus placeholder="e.g., MCA Semester Project" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
                    <button className="flex-1 bg-white shadow-sm text-blue-600 font-semibold py-2.5 rounded-lg text-sm">Blank Document</button>
                    <button className="flex-1 text-gray-500 hover:text-gray-700 font-semibold py-2.5 rounded-lg text-sm">Import PDF</button>
                  </div>
                </div>
                <button className="w-full mt-4 bg-[#1c1c21] hover:bg-black text-white font-semibold py-3.5 rounded-xl transition-all shadow-md">
                  Create Notebook
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. USER PROFILE MODAL */}
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
            
            {/* Slides up from bottom on mobile, floats on right on desktop */}
            <motion.div 
              initial={{ opacity: 0, y: "100%" }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 w-full md:w-auto md:right-4 md:top-4 md:bottom-4 md:max-w-sm bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-8 flex flex-col"
            >
              {/* Mobile handle indicator */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-[#1c1c21]">Account</h2>
                <button onClick={() => setIsProfileOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-50 p-2 rounded-full"><FiX size={20}/></button>
              </div>
              
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg shadow-blue-500/20 mb-4">
                  {displayFullName.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{displayFullName}</h3>
                <p className="text-gray-500 text-sm font-medium">{displayEmail}</p>
                <span className="mt-2 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">KIIT MCA Student</span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pb-4">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                  <div className="bg-gray-100 text-gray-600 p-2.5 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"><FiUser size={18}/></div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Edit Profile</p>
                    <p className="text-xs text-gray-500">Update your name and photo</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                  <div className="bg-gray-100 text-gray-600 p-2.5 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"><FiSettings size={18}/></div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Preferences</p>
                    <p className="text-xs text-gray-500">Theme, notifications, and AI settings</p>
                  </div>
                </button>
              </div>

              <button onClick={handleLogOut} className="mt-2 md:mt-auto w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3.5 rounded-xl transition-all mb-4 md:mb-0">
                <FiLogOut size={18} /> Sign Out
              </button>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}