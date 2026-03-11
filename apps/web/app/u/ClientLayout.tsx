"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, FiBook, FiUsers, FiCpu, FiBell, 
  FiSettings, FiLogOut, FiMenu, FiUser, FiBookOpen 
} from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence, Variant, Variants } from 'framer-motion';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const { profile, user, isLoading } = useUser();
  
  const displayFullName = profile?.name || user?.user_metadata?.full_name || 'NoteBook User';
  const displayInitials = displayFullName.substring(0, 2).toUpperCase();

  const navItems = [
    { icon: FiHome, label: 'Dashboard', path: '/u' },
    { icon: FiBook, label: 'Notebooks', path: '/u/notebooks' },
    { icon: FiUsers, label: 'Collaboration', path: '/u/collaboration' },
    { icon: FiCpu, label: 'AI Hub', path: '/u/ai' },
  ];

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    router.push('/'); 
  };

  // Spring config for sidebar width — feels physical and natural
  const sidebarSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  };

  // Stagger container for nav items
  const navContainerVariants: Variants = {
    expanded: {
      transition: { staggerChildren: 0.04, delayChildren: 0.05 },
    },
    collapsed: {
      transition: { staggerChildren: 0.02, staggerDirection: -1 },
    },
  };

  // Each nav label slides in from the left and fades — never layout-shifts
  const labelVariants: Variants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 400, damping: 28 },
    },
    collapsed: {
      opacity: 0,
      x: -8,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-gray-900 selection:bg-blue-100">
      
      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={sidebarSpring}
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen bg-white border-r border-gray-100
          flex flex-col overflow-hidden will-change-[width]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ minWidth: isCollapsed ? 72 : 256 }}
      >
        {/* LOGO / TOGGLE */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-16 flex items-center px-5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors duration-200 shrink-0"
          title="Toggle Sidebar"
        >
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl tracking-tight overflow-hidden">
            {/* Icon cross-fades between open/closed states */}
            <motion.div
              key={isCollapsed ? "book" : "bookopen"}
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="shrink-0"
            >
              {isCollapsed ? <FiBook size={22} /> : <FiBookOpen size={22} />}
            </motion.div>

            {/* Brand text slides + fades — no layout jump */}
            <div className="overflow-hidden h-7 flex items-center">
              <motion.span
                variants={labelVariants}
                animate={isCollapsed ? "collapsed" : "expanded"}
                className="text-gray-900 whitespace-nowrap block leading-none"
              >
                Note<span className="text-blue-600">Book</span>
              </motion.span>
            </div>
          </div>
        </div>

        {/* NAV */}
        <div className="flex-1 py-5 overflow-y-auto overflow-x-hidden">

          {/* Section label */}
          <div className="h-6 mb-3 flex items-center px-5 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isCollapsed ? (
                <motion.div
                  key="dots"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                >
                  <BsThreeDots className="text-gray-300" size={16} />
                </motion.div>
              ) : (
                <motion.p
                  key="text"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                >
                  Workspace
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Nav items */}
          <motion.div
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={navContainerVariants}
            className="space-y-0.5"
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.path ||
                (item.path !== '/u' && pathname.startsWith(`${item.path}/`));

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={isCollapsed ? item.label : ""}
                  className={`
                    flex items-center gap-3 py-2.5 mx-2 rounded-xl text-sm font-semibold
                    transition-colors duration-150 group
                    ${isCollapsed ? 'px-4.5 justify-center' : 'px-4'}
                    ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {/* Icon — scales up slightly when active */}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="shrink-0"
                  >
                    <item.icon
                      size={19}
                      className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                    />
                  </motion.div>

                  {/* Label — slides in/out, never causes reflow */}
                  <div className="overflow-hidden h-5 flex items-center">
                    <motion.span
                      variants={labelVariants}
                      className="whitespace-nowrap block leading-none"
                    >
                      {item.label}
                    </motion.span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* Collapse hint at bottom */}
        <div className="shrink-0 p-3 border-t border-gray-50">
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center h-8 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors duration-150"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={sidebarSpring}
            >
              {/* Chevron left/right */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 11L5 7L9 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.button>
        </div>
      </motion.aside>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiMenu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors mr-1">
              <FiBell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="relative">
              {isDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              )}

              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative z-50 flex items-center hover:opacity-80 transition-opacity focus:outline-none"
              >
                {isLoading ? (
                  <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase shadow-sm border border-blue-200">
                    {displayInitials}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="font-bold text-gray-900 truncate text-sm">{displayFullName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium">
                        <FiUser size={16} /> Edit Profile
                      </button>
                      <button className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium">
                        <FiSettings size={16} /> Settings
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-50">
                      <button
                        onClick={handleLogOut}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                      >
                        <FiLogOut size={16} /> Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#fafafa]">
          <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}