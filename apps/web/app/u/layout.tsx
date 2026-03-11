// apps/web/app/u/layout.tsx
import React from 'react';
import ClientLayout from './ClientLayout';
import { UserProvider } from '@/context/UserContext';

// We removed 'force-dynamic' and 'await supabase'.
// This file now renders instantly.

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ClientLayout>
        {children}
      </ClientLayout>
    </UserProvider>
  );
}