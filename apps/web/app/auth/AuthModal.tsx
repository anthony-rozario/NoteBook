"use client";

import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaGithub, FaGoogle, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa'; 
import { login, signUp, resetPassword } from '@/app/auth/actions'; // Added resetPassword!

interface AuthModalProps {
  isOpen: boolean;
  initialView?: 'login' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialView = 'signup', onClose }: AuthModalProps) {
  const [isRightPanelActive, setIsRightPanelActive] = useState<boolean>(initialView === 'signup');
  const [enableTransition, setEnableTransition] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null); // NEW: For the reset email confirmation
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState<boolean>(false); // NEW: Toggles the reset form

  // Reset all states when modal opens/closes or changes sides
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setEnableTransition(false);
      setIsRightPanelActive(initialView === 'signup');
      setShowPassword(false);
      setIsForgotPasswordView(false);
      setError(null);
      setSuccessMsg(null);
      
      const timer = setTimeout(() => setEnableTransition(true), 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
      setEnableTransition(false);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const response = await signUp(formData);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const response = await login(formData);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  // NEW: Handler for sending the reset link
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const response = await resetPassword(formData);

    if (response?.error) {
      setError(response.error);
    } else {
      setSuccessMsg("Check your email for a password reset link!");
      // Optionally, you can auto-switch back to the login view after a few seconds here
    }
    setLoading(false);
  };

  const transitionClass = enableTransition ? "transition-all duration-600 ease-in-out" : "";
  const inputClasses = "bg-gray-50 border border-gray-200 p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 transition-all";
  const socialButtonClasses = "p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900 flex items-center justify-center gap-2 text-sm w-full font-medium shadow-sm";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={handleClose}></div>

      <div className="relative overflow-hidden w-full max-w-4xl min-h-137.5 bg-white rounded-2xl shadow-2xl z-10">
        
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 z-150 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
        >
          <IoClose size={24} />
        </button>

        {/* --- SIGN UP CONTAINER --- */}
        <div className={`absolute top-0 h-full w-1/2 left-0 ${transitionClass} ${isRightPanelActive ? 'translate-x-full opacity-100 z-50' : 'opacity-0 z-10'}`}>
          <form onSubmit={handleSignUp} className="bg-white flex flex-col px-12 h-full justify-center items-center text-center">
            <h1 className="font-bold text-3xl m-0 text-gray-900">Create Account</h1>
            
            <div className="flex flex-col gap-2 mt-6 mb-4 w-full">
              <span className="text-xs text-gray-500 font-medium">Sign Up with</span>
              <div className="flex gap-3 justify-center w-full">
                <button type="button" className={socialButtonClasses}>
                  <FaGoogle size={18} /> Google
                </button>
                <button type="button" className={socialButtonClasses}>
                  <FaGithub size={18} /> GitHub
                </button>
              </div>
            </div>

            <span className="text-xs mb-3 text-gray-400">or use your email for registration</span>
            
            <input type="text" name="name" placeholder="Name" required className={`my-2 ${inputClasses}`} />
            <input type="email" name="email" placeholder="Email" required className={`my-2 ${inputClasses}`} />
            
            <div className="relative w-full my-2">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                required 
                minLength={6} 
                className={inputClasses} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-start w-full mt-1 mb-2">
              <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" name="remember" className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                Remember me
              </label>
            </div>
            
            {error && !isRightPanelActive && <p className="text-red-500 text-xs mt-1">{error}</p>}
            
            <button disabled={loading} type="submit" className="mt-4 rounded-full border border-transparent bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-12 tracking-wide transition-all active:scale-95 disabled:opacity-50 shadow-md w-full">
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* --- SIGN IN / RESET PASSWORD CONTAINER --- */}
        <div className={`absolute top-0 h-full w-1/2 left-0 z-20 ${transitionClass} ${isRightPanelActive ? 'translate-x-full' : 'translate-x-0'}`}>
          
          {/* TOGGLE VIEW: Show Reset Password OR Sign In */}
          {isForgotPasswordView ? (
            
            /* RESET PASSWORD FORM */
            <form onSubmit={handleResetPassword} className="bg-white flex flex-col px-12 h-full justify-center items-center text-center">
              <h1 className="font-bold text-3xl m-0 text-gray-900">Reset Password</h1>
              <span className="text-sm mt-4 mb-6 text-gray-500">Enter your email address and we'll send you a link to reset your password.</span>
              
              <input type="email" name="email" placeholder="Email" required className={`my-2 ${inputClasses}`} />
              
              {error && isRightPanelActive === false && <p className="text-red-500 text-xs mt-2">{error}</p>}
              {successMsg && isRightPanelActive === false && <p className="text-green-600 text-xs mt-2 font-medium bg-green-50 p-2 rounded w-full border border-green-200">{successMsg}</p>}
              
              <button disabled={loading} type="submit" className="mt-6 rounded-full border border-transparent bg-gray-900 hover:bg-black text-white text-sm font-bold py-3 px-12 tracking-wide transition-all active:scale-95 disabled:opacity-50 shadow-md w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button 
                type="button" 
                onClick={() => { setIsForgotPasswordView(false); setError(null); setSuccessMsg(null); }}
                className="mt-6 text-sm text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors"
              >
                <FaArrowLeft /> Back to Sign In
              </button>
            </form>

          ) : (

            /* STANDARD SIGN IN FORM */
            <form onSubmit={handleSignIn} className="bg-white flex flex-col px-12 h-full justify-center items-center text-center">
              <h1 className="font-bold text-3xl m-0 text-gray-900">Sign in</h1>
              
              <div className="flex flex-col gap-2 mt-6 mb-4 w-full">
                <span className="text-xs text-gray-500 font-medium">Sign in with</span>
                <div className="flex gap-3 justify-center w-full">
                  <button type="button" className={socialButtonClasses}>
                    <FaGoogle size={18} /> Google
                  </button>
                  <button type="button" className={socialButtonClasses}>
                    <FaGithub size={18} /> GitHub
                  </button>
                </div>
              </div>

              <span className="text-xs mb-3 text-gray-400">or use your account</span>
              
              <input type="email" name="email" placeholder="Email" required className={`my-2 ${inputClasses}`} />
              
              <div className="relative w-full my-2">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password" 
                  required 
                  className={inputClasses} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between w-full mt-1 mb-2">
                <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" name="remember" className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                  Remember me
                </label>
                <button 
                  type="button" 
                  onClick={() => setIsForgotPasswordView(true)} // Switches to Reset Password View
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              
              {error && isRightPanelActive === false && <p className="text-red-500 text-xs mt-1">{error}</p>}
              
              <button disabled={loading} type="submit" className="mt-4 rounded-full border border-transparent bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-12 tracking-wide transition-all active:scale-95 disabled:opacity-50 shadow-md w-full">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        {/* --- OVERLAY CONTAINER --- */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-100 ${transitionClass} ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`bg-black text-gray-200 relative -left-full h-full w-[200%] ${transitionClass} ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            <div className={`absolute flex flex-col items-center justify-center px-10 text-center top-0 h-full w-1/2 ${transitionClass} ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <h1 className="font-bold text-3xl m-0 text-white">Welcome Back!</h1>
              <p className="text-sm font-light leading-relaxed my-5 max-w-xs text-gray-400">Ready to dive back into your notebooks? Log in to continue.</p>
              <button 
                type="button" 
                onClick={() => { 
                  setIsRightPanelActive(false); 
                  setError(null); 
                  setIsForgotPasswordView(false); // Reset to standard sign in
                }} 
                className="rounded-full border border-white bg-transparent text-white text-sm font-bold py-3 px-12 tracking-wide transition-all active:scale-95 hover:bg-white/10 mt-2"
              >
                Sign In
              </button>
            </div>
            
            <div className={`absolute flex flex-col items-center justify-center px-10 text-center top-0 h-full w-1/2 right-0 ${transitionClass} ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <h1 className="font-bold text-3xl m-0 text-white">Hello, Friend!</h1>
              <p className="text-sm font-light leading-relaxed my-5 max-w-xs text-gray-400">Start your journey with us today. Organize your thoughts and enhance your learning.</p>
              <button 
                type="button" 
                onClick={() => { 
                  setIsRightPanelActive(true); 
                  setError(null); 
                  setIsForgotPasswordView(false); // Reset to standard sign in
                }} 
                className="rounded-full border border-white bg-transparent text-white text-sm font-bold py-3 px-12 tracking-wide transition-all active:scale-95 hover:bg-white/10 mt-2"
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}