import React from 'react';
import { FiMessageSquare, FiBell, FiCheckCircle } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function NotificationsPage() {
  // Mock data matching your screenshot exactly
  const notifications = [
    {
      id: 1,
      type: 'comment',
      message: "Jane left a comment on 'Physics Notes'",
      time: '10 mins ago',
      isRead: false,
    },
    {
      id: 2,
      type: 'ai',
      message: "AI Summary generated for 'Chapter 4'",
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: 3,
      type: 'system',
      message: "You were added as an editor to 'Group Project'",
      time: 'Yesterday',
      isRead: true,
    },
  ];

  // Helper to render the correct icon and color based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FiMessageSquare size={18} /></div>;
      case 'ai':
        return <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><BsStars size={18} /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><FiBell size={18} /></div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Stay updated on your workspace activity.
          </p>
        </div>
        
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm shrink-0">
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${
              notif.isRead 
                ? 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm' 
                : 'bg-blue-50/30 border border-blue-200 border-l-4 border-l-blue-500 shadow-sm'
            }`}
          >
            
            {/* Left Side: Icon & Content */}
            <div className="flex items-center gap-4">
              {getIcon(notif.type)}
              
              <div className="flex flex-col">
                <span className={`text-sm md:text-base ${notif.isRead ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                  {notif.message}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  {notif.time}
                </span>
              </div>
            </div>

            {/* Right Side: Action (Checkmark for unread items) */}
            {!notif.isRead && (
              <button 
                className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors focus:outline-none shrink-0"
                title="Mark as read"
              >
                <FiCheckCircle size={20} />
              </button>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}