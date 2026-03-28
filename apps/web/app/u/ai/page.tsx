"use client";

import React from 'react';
import { useUser } from '@/context/UserContext';
import { 
  FiChevronDown, FiStar, FiPlus, FiMic, FiSend, 
  FiZap, FiImage, FiSearch, FiFileText, FiCpu, FiGrid, FiClock 
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function DashboardPage() {
  const { profile, user } = useUser();
  const displayFirstName = profile?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Anthony';

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-gray-50/30 overflow-y-auto custom-scrollbar relative">
      
      {/* Header Row */}
      <div className="flex items-center justify-between px-8 py-6 shrink-0">
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <BsStars className="text-blue-500" />
          NoteBook AI v1.0
          <FiChevronDown className="text-gray-400 ml-1" />
        </button>

        <span className="text-sm font-semibold text-gray-500 tracking-wide">
          Daily NoteBook
        </span>

        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1c1c21] hover:bg-black px-4 py-2 rounded-full shadow-sm transition-all">
          <FiStar className="text-amber-300 fill-amber-300" />
          Upgrade
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-12 pt-10 pb-8 shrink-0">
        <h1 className="text-4xl md:text-[44px] leading-tight font-medium text-[#1c1c21] tracking-tight max-w-xl">
          <span className="text-gray-400">Hi {displayFirstName},</span> Ready to <br/>
          <span className="font-semibold">Achieve Great Things?</span>
        </h1>
      </div>

      {/* The 3 Floating Cards */}
      <div className="px-12 grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        
        {/* Card 1 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
            <FiFileText className="text-orange-500" size={20} />
          </div>
          <p className="text-[#1c1c21] font-semibold text-lg leading-snug mb-8 flex-1">
            Organize your notes, extract text from PDFs, and manage your KIIT coursework.
          </p>
          <span className="text-xs font-semibold text-gray-400">Fast Start</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-6">
            <FiGrid className="text-green-600" size={20} />
          </div>
          <p className="text-[#1c1c21] font-semibold text-lg leading-snug mb-8 flex-1">
            Stay connected, share project ideas, and align goals effortlessly with peers.
          </p>
          <span className="text-xs font-semibold text-gray-400">Collaborate with Team</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col hover:-translate-y-1 transition-transform duration-300 relative">
          <div className="absolute -top-12 right-4 hidden lg:flex flex-col items-center">
            <div className="bg-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md mb-2 flex items-center gap-1">
              Hey there! 👋 <br/> Need a summary?
            </div>
            {/* Robot Placeholder */}
            <div className="w-16 h-16 bg-gray-100 rounded-full border-4 border-white shadow-inner flex items-center justify-center text-2xl">🤖</div>
          </div>

          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
            <FiClock className="text-blue-500" size={20} />
          </div>
          <p className="text-[#1c1c21] font-semibold text-lg leading-snug mb-8 flex-1">
            Organize your time efficiently, summarize lectures, and stay focused.
          </p>
          <span className="text-xs font-semibold text-gray-400">Planning</span>
        </div>

      </div>

      {/* The AI Prompt Bar (Pinned to Bottom) */}
      <div className="mt-auto px-12 pb-8 pt-12 shrink-0">
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-2 border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
          
          {/* Top Info Bar */}
          <div className="flex items-center justify-between px-6 py-3 text-xs font-semibold text-gray-400">
            <div className="flex items-center gap-2">
              <BsStars /> Unlock more with Pro Plan
            </div>
            <div className="flex items-center gap-2">
              <FiCpu /> Powered by NoteBook AI Hub
            </div>
          </div>

          {/* Input Box */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-2">
            <div className="flex items-center gap-3 px-4 py-2">
              <button className="text-gray-400 hover:text-gray-600"><FiPlus size={20}/></button>
              <input 
                type="text" 
                placeholder='Example: "Summarize my MCA Database Notes"'
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 font-medium"
              />
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <FiMic size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1c1c21] flex items-center justify-center text-white hover:bg-black transition-colors shadow-md">
                <FiSend size={16} className="-ml-1 mt-0.5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 px-2 pb-2 pt-1">
              <button className="flex items-center gap-2 bg-[#1c1c21] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-black transition-colors">
                <FiZap /> Deep Research
              </button>
              <button className="flex items-center gap-2 bg-[#1c1c21] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-black transition-colors">
                <FiImage /> Extract PDF
              </button>
              <button className="flex items-center gap-2 bg-[#1c1c21] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-black transition-colors">
                <FiSearch /> Search Notes
              </button>
              <button className="flex items-center gap-2 bg-[#1c1c21] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-black transition-colors">
                <FiFileText /> Summarize
              </button>
              <button className="w-9 h-9 flex items-center justify-center bg-[#1c1c21] text-white rounded-full hover:bg-black transition-colors">
                <span className="tracking-widest mb-1">...</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}