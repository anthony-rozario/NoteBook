"use client";

import React from 'react';
import Link from 'next/link';
import { 
  FiUsers, FiFileText, FiShare2, FiMoreVertical, 
  FiExternalLink, FiUserPlus, FiLock
} from 'react-icons/fi';

export default function CollaborationPage() {
  // Enhanced mock data to fit your workflow
  const sharedWithMe = [
    { id: 1, title: 'Advanced DBMS Notes (MCA)', sharedBy: 'Priya M.', role: 'Editor', initials: 'PM', color: 'bg-rose-100 text-rose-600', time: '2h ago' },
    { id: 2, title: 'Next.js App Architecture', sharedBy: 'Rahul S.', role: 'Viewer', initials: 'RS', color: 'bg-indigo-100 text-indigo-600', time: 'Yesterday' },
    { id: 3, title: 'Flowbite UI Components List', sharedBy: 'Amit K.', role: 'Editor', initials: 'AK', color: 'bg-teal-100 text-teal-600', time: '3d ago' },
  ];

  const sharedByMe = [
    { 
      id: 1, 
      title: 'Rozaa Tech Client Proposal', 
      isPublic: false,
      collaborators: [
        { initials: 'RS', color: 'bg-indigo-100 text-indigo-700' },
        { initials: 'PM', color: 'bg-rose-100 text-rose-700' },
        { initials: 'AK', color: 'bg-teal-100 text-teal-700' }
      ]
    },
    { 
      id: 2, 
      title: 'Spotify Clone Architecture', 
      isPublic: true,
      collaborators: [
        { initials: 'JD', color: 'bg-blue-100 text-blue-700' }
      ]
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-8 md:p-12 z-10 relative">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1c1c21] tracking-tight mb-2">
            Collaboration Hub
          </h1>
          <p className="text-gray-500 font-medium">
            Manage files shared with you and control access to your own workspace.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#1c1c21] hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
          <FiShare2 size={18} /> Share Notebook
        </button>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 items-start">
        
        {/* LEFT COLUMN: Shared with me */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1c1c21] flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FiUsers size={20} />
              </div>
              Shared with me
            </h2>
            <span className="bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-100">
              {sharedWithMe.length} Files
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {sharedWithMe.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-blue-100 hover:shadow-sm rounded-2xl transition-all group cursor-pointer">
                
                <div className="flex items-center gap-4">
                  {/* Vibrant Avatar */}
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}>
                    {item.initials}
                  </div>
                  
                  {/* Details */}
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1c1c21] text-base group-hover:text-blue-600 transition-colors">{item.title}</span>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-1">
                      <span>{item.sharedBy}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className={item.role === 'Editor' ? 'text-blue-500' : 'text-gray-400'}>{item.role}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>

                {/* Hidden Action Button that appears on hover */}
                <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0">
                  <FiExternalLink size={18} />
                </button>
                
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Shared by me */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1c1c21] flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <FiFileText size={20} />
              </div>
              Shared by me
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {sharedByMe.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-100 hover:border-purple-100 hover:shadow-sm rounded-2xl transition-all group gap-4">
                
                {/* Text Details */}
                <div className="flex flex-col">
                  <span className="font-bold text-[#1c1c21] text-base group-hover:text-purple-600 transition-colors flex items-center gap-2">
                    {item.title}
                    {!item.isPublic && <FiLock className="text-gray-400" size={14} title="Private Sharing" />}
                  </span>
                  <span className="text-xs font-medium text-gray-400 mt-1">
                    {item.isPublic ? 'Public Link Active' : 'Restricted Access'}
                  </span>
                </div>

                {/* Overlapping Avatars & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  
                  {/* Avatar Cluster */}
                  <div className="flex items-center -space-x-2">
                    {item.collaborators.map((collab, idx) => (
                      <div key={idx} className={`w-8 h-8 rounded-full ${collab.color} flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-white transition-all`}>
                        {collab.initials}
                      </div>
                    ))}
                    <button className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center shadow-sm z-10 transition-colors">
                      <FiUserPlus size={12} />
                    </button>
                  </div>

                  <button className="text-gray-400 hover:text-gray-900 p-1 transition-colors">
                    <FiMoreVertical size={20} />
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}