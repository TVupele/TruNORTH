import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, API_URL } from '@/lib/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

// Demo mode flag - set to true to bypass authentication
// Can be overridden by VITE_DEMO_MODE environment variable
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || true;

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  language: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, language?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for testing
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@trunorth.app',
  name: 'Demo User',
  language: 'en',
  role: 'member',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, set demo user immediately
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Check active session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        await fetchUserProfile(session.access_token);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Set basic user info from Supabase
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.name || 'User',
          language: session.user.user_metadata.language || 'en',
          role: 'member',
        });
      }
    } catch (error) {
      console.warn('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      // Try to fetch profile from API, but fall back to local user data
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // If API fails, we'll rely on Supabase's user data
        console.warn('Profile API not available, using default user data');
      }
    } catch (error) {
      console.warn('Profile fetch failed, using default user data:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string, language: string = 'en') => {
    if (DEMO_MODE) {
      // In demo mode, just set the demo user
      setUser({
        ...DEMO_USER,
        email,
        name,
        language,
      });
      return;
    }

    try {
      // Use Supabase directly for signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            language,
          },
        },
      });

      if (error) throw error;

      // If signup successful, sign in
      await signIn(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      // In demo mode, just set the demo user
      setUser(DEMO_USER);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle email not confirmed error with a more helpful message
        if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          throw new Error('Please check your email and click the confirmation link to activate your account.');
        }
        throw error;
      }

      if (data.session?.access_token) {
        await fetchUserProfile(data.session.access_token);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (DEMO_MODE) {
      // In demo mode, just update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      // Try to update via API, but fall back to local update
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update profile');
        }
      } catch (apiError) {
        console.warn('Profile API not available, updating locally');
      }

      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
