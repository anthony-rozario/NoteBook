"use client";

import { useState } from "react";
import Feature from "../components/Features"
import Footer from "../components/Footer"
import HeroSection from "../components/Hero"
import AuthModal from "@/app/auth/AuthModal" // Make sure this path matches your folder structure!

export default function Home() {
  // 1. State to control the modal visibility and which side to show
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup');

  // 2. Helper function to open the modal to a specific view
  const openAuth = (view: 'login' | 'signup') => {
    setAuthView(view);
    setIsAuthOpen(true);
  };

  return (
    <>
      {/* 3. Pass the openAuth function down to your HeroSection as a prop */}
      <HeroSection onOpenAuth={openAuth} />
      
      {/* Feature Section */}
      <Feature />
      
      {/* Footer */}
      <Footer />

      {/* 4. The Auth Modal Component */}
      <AuthModal 
        isOpen={isAuthOpen} 
        initialView={authView}
        onClose={() => setIsAuthOpen(false)} 
      />
    </>
  )
}