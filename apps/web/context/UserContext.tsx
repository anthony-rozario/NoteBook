// apps/web/context/UserContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type UserContextType = {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({ 
  user: null, 
  profile: null, 
  isLoading: true 
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      // 1. Get the Auth User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        // 2. Get your public users table data (for the custom Name/Role)
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        setProfile(dbUser);
      }
      setIsLoading(false);
    }
    
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook so you can easily grab user data in any file!
export const useUser = () => useContext(UserContext);