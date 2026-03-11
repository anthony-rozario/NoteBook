import React from 'react';
import { FiUsers, FiFileText } from 'react-icons/fi';

export default function CollaborationPage() {
  // Mock data matching your screenshot
  const sharedWithMe = [
    { id: 1, title: 'Group Project Outline 1', sharedBy: 'Jane Doe', role: 'Editor', initials: 'JD' },
    { id: 2, title: 'Group Project Outline 2', sharedBy: 'Jane Doe', role: 'Editor', initials: 'JD' },
    { id: 3, title: 'Group Project Outline 3', sharedBy: 'Jane Doe', role: 'Editor', initials: 'JD' },
  ];

  const sharedByMe = [
    { id: 1, title: 'My Thesis Draft 1', sharedWithCount: 3 },
    { id: 2, title: 'My Thesis Draft 2', sharedWithCount: 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Collaboration Hub</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Manage files shared with you and files you've shared with others.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Shared with me */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Section Header */}
          <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
            <FiUsers className="text-[#3b82f6] text-xl" />
            <h2 className="font-bold text-gray-900 text-lg">Shared with me</h2>
          </div>

          {/* List Items (divide-y creates the lines between items) */}
          <div className="flex flex-col divide-y divide-gray-50 p-2">
            {sharedWithMe.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group">
                
                {/* Avatar & Text */}
                <div className="flex items-center gap-4">
                  {/* Avatar Circle */}
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-[#3b82f6] flex items-center justify-center font-bold text-sm shrink-0">
                    {item.initials}
                  </div>
                  
                  {/* Text Details */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      Shared by {item.sharedBy} • {item.role}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors">
                  Open
                </button>
                
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Shared by me */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Section Header */}
          <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
            <FiFileText className="text-purple-600 text-xl" />
            <h2 className="font-bold text-gray-900 text-lg">Shared by me</h2>
          </div>

          {/* List Items */}
          <div className="flex flex-col divide-y divide-gray-50 p-2">
            {sharedByMe.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group">
                
                {/* Text Details */}
                <div className="flex flex-col py-1">
                  <span className="font-semibold text-gray-900">{item.title}</span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    Shared with {item.sharedWithCount} people
                  </span>
                </div>

                {/* Action Button */}
                <button className="text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 px-4 py-1.5 rounded-lg transition-all shadow-sm shrink-0">
                  Manage Access
                </button>
                
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}