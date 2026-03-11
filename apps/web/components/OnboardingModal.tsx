"use client";

import React, { useState } from 'react';
import { completeOnboarding } from '@/app/auth/actions';

export default function OnboardingModal({ needsOnboarding }: { needsOnboarding: boolean }) {
  const [userType, setUserType] = useState<'student' | 'professional'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If their profile is already complete, don't render anything!
  if (!needsOnboarding) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('userType', userType); // Inject the toggle state

    const response = await completeOnboarding(formData);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
    // If successful, the Server Action triggers a revalidation and this component unmounts automatically!
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome to NoteBook! 🎉</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Let's customize your workspace before you dive in.</p>

          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button 
              type="button" onClick={() => setUserType('student')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${userType === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Student
            </button>
            <button 
              type="button" onClick={() => setUserType('professional')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${userType === 'professional' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Professional
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

            {userType === 'student' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Institution / University *</label>
                  <input type="text" name="institution" required placeholder="e.g., Harvard University" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm text-gray-900 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course / Major *</label>
                  <input type="text" name="course" required placeholder="e.g., Computer Science" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm text-gray-900 outline-none transition-all" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Profession *</label>
                  <input type="text" name="profession" required placeholder="e.g., Software Engineer" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm text-gray-900 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company *</label>
                  <input type="text" name="company" required placeholder="e.g., Google" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm text-gray-900 outline-none transition-all" />
                </div>
              </>
            )}

            <button 
              type="submit" disabled={loading}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? 'Setting up your workspace...' : 'Complete Profile'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}