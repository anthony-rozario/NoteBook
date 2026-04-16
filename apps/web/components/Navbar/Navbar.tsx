"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiBookOpen } from "react-icons/fi"; // Specific icon from image_0.png
import { createClient } from "@/utils/supabase/client"; // Shared client for client components
import AuthModal from "@/app/auth/AuthModal"; // Assuming this is the correct path to your AuthModal


export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');


  // 1. Hide Navbar on /u or any nested /u routes
  const isWorkspaceRoute = pathname === "/u" || pathname?.startsWith("/u/");

  useEffect(() => {
    // Only check auth if we are actually rendering the navbar
    if (isWorkspaceRoute) return;

    const supabase = createClient();
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    // Listen for login/logout events
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [isWorkspaceRoute]);

  if (isWorkspaceRoute) {
    return null; // Renders absolutely nothing when inside the /u routes
  }

  return (
    <>
    {/* LIQUID GLASS CONTAINER: Transparent, high-blur, with soft white/20 highlight border */}
    <nav className="flex items-center justify-between px-6 py-4 bg-white/30 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-shadow duration-300">
      
      {/* Brand Logo - Left */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {/* Balanced size: smaller container, larger icon for cleaner look */}
        <div className="bg-white/10 py-2.5 pl-2.5 rounded-full border border-white/20">
          <FiBookOpen size={26} className="text-[#28282B]/90" /> 
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">NoteBook</span>
      </Link>

      {/* Navigation Links - Center (Hidden on small screens) */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
        <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
        <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
        <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
      </div>

      {/* Auth Actions - Right */}
      <div className="flex items-center gap-4">
        {loading ? (
          // Glassy Loading Skeleton
          <div className="w-20 h-8 bg-white/20 animate-pulse rounded-full border border-white/10"></div>
        ) : user ? (
          // Logged In State: Semi-transparent blue with inner highlight
          <Link 
            href="/u" 
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-500/80 rounded-full backdrop-blur-sm border border-white/20 hover:bg-blue-600/90 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-200/50"
          >
            Go to Workspace
          </Link>
        ) : (
          // Logged Out State (Matches image_0.png)
         <>
              <button 
                // Set to 'login' and open modal
                onClick={() => { setAuthView('login'); setIsAuthModalOpen(true); }}
                className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </button>
              <button 
                // Set to 'signup' and open modal
                onClick={() => { setAuthView('signup'); setIsAuthModalOpen(true); }}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#1b1a1a] rounded-full backdrop-blur-sm border border-white/20 hover:bg-[#28282B] transition-all shadow-sm hover:shadow-lg hover:shadow-blue-200/50"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Pass the authView as a new prop: initialView */}
      <AuthModal 
          isOpen={isAuthModalOpen} 
          initialView={authView} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
    </>
  );
}