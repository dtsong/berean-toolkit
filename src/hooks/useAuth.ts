/**
 * Hook for accessing authentication context
 * Must be used within AuthProvider
 */

'use client';

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
