// apps/web/app/u/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { FiPlus, FiStar, FiArrowRight } from 'react-icons/fi';
import RealtimeNotebooks from '@/components/RealtimeNotebooks';
import { useUser } from '@/context/UserContext';
import { motion, Variants } from 'framer-motion'; // <-- Import Variants here!
import CreateNotebookButton from '@/components/CreateNotebookButton';



// 1. Define the animation rules for the parent container
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay each child animation by 0.15s
      ease: "easeOut",
    },
  },
};

// 2. Define the animation rules for each individual section
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

export default function Dashboard() {
  const { user, profile, isLoading } = useUser();

  const fullNameToUse = profile?.name || user?.user_metadata?.full_name;
  const firstName = fullNameToUse?.split(' ')[0] || 'Friend';

  // Smooth fade-in for the loading skeleton
  if (isLoading) {
    return (
      <motion.div 
        key="dashboard-loading" // <--- ADD THIS KEY
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="animate-pulse h-64 bg-gray-100 rounded-3xl w-full"
      />
    );
  }

  return (
    // 2. Add a key to the main content container
    <motion.div 
      key="dashboard-content" // <--- ADD THIS KEY
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col xl:flex-row gap-8 pb-10"
    >
      
      {/* LEFT COLUMN: Main Content */}
      <div className="flex-1 space-y-8">
        
        {/* HERO BANNER - Slides in first */}
        <motion.div variants={itemVariants} className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-blue-100 max-w-lg mb-8 text-sm md:text-base leading-relaxed">
              You have 0 unread notifications. Ready to capture some brilliant ideas today?
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <CreateNotebookButton className="bg-white text-blue-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95" />
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 active:scale-95">
                <FiStar size={18} /> Ask AI
              </button>
            </div>
          </div>
        </motion.div>

        {/* RECENT NOTEBOOKS SECTION - Slides in second */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Recent Notebooks</h2>
            <Link href="/u/notebooks" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              View all <FiArrowRight size={16} />
            </Link>
          </div>

          <RealtimeNotebooks />
        </motion.section>
      </div>

      {/* RIGHT COLUMN: Sidebar Content - Slides in third */}
      <motion.div variants={itemVariants} className="w-full xl:w-80 space-y-8">
        {/* Paste your AI Insights and Recent Activity code back exactly as it was here! */}
      </motion.div>

    </motion.div>
  );
}