import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export function normalizeAppRole(rawRole) {
  if (!rawRole) return null;
  const upper = String(rawRole).trim().toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  if (upper === 'FIELD_OFFICER' || upper === 'OFFICER') return 'officer';
  if (upper === 'ANALYST' || upper === 'INTELLIGENCE_ANALYST') return 'analyst';
  if (upper === 'ADMIN' || upper === 'SYSTEM_ADMINISTRATOR') return 'admin';
  return null;
}

export function resolveAccountRole(user, profileData = null) {
  if (!user) return null;

  // 1. Authoritative: public.user_profiles table row
  if (profileData?.role) {
    const fromProfile = normalizeAppRole(profileData.role);
    if (fromProfile) return fromProfile;
  }

  // 2. Authoritative: Supabase JWT server-verified app_metadata.role
  const fromAppMetadata = normalizeAppRole(user.app_metadata?.role);
  if (fromAppMetadata) return fromAppMetadata;

  // 3. Authoritative mapping for verified official departmental accounts
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  if (normalizedEmail === 'crimeintel.admin@gmail.com') return 'admin';
  if (normalizedEmail === 'crimeintel.analystt@gmail.com') return 'analyst';
  if (normalizedEmail === 'crimeintel.officer@gmail.com') return 'officer';

  // 4. Safe least-privilege default
  return 'officer';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or resolve user profile from Supabase
  const loadProfile = useCallback(async (activeUser, activeSession) => {
    if (!activeUser) {
      setProfile(null);
      setRole(null);
      return;
    }

    let profileData = null;

    // 1. Query public.user_profiles if Supabase client is configured
    try {
      if (isSupabaseConfigured && activeSession) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', activeUser.id)
          .maybeSingle();

        if (!error && data) {
          profileData = data;
        }
      }
    } catch (err) {
      console.warn('[AuthContext]: Profile table lookup notice:', err);
    }

    // 2. Resolve authoritative role
    const resolvedRole = resolveAccountRole(activeUser, profileData) || 'officer';
    setRole(resolvedRole);
    setProfile(profileData || {
      user_id: activeUser.id,
      email: activeUser.email,
      full_name: activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || activeUser.email?.split('@')[0],
      badge_number: activeUser.user_metadata?.badge_number || null,
      role: resolvedRole.toUpperCase(),
    });
  }, []);

  // Initialize and listen to active Supabase session
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        if (!isSupabaseConfigured) {
          // If Supabase keys are not set, stop loading
          if (isMounted) setIsLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[AuthContext]: Session retrieval warning:', error);
        }

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          if (initialSession?.user) {
            await loadProfile(initialSession.user, initialSession);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[AuthContext]: Auth initialization error:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    initializeAuth();

    // Subscribe to auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await loadProfile(newSession.user, newSession);
        } else {
          setProfile(null);
          setRole(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [loadProfile]);

  // Login with official departmental credentials
  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase authentication is not configured. Please define VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }

    setSession(data.session);
    setUser(data.user);
    await loadProfile(data.user, data.session);
    return data;
  };

  // Sign out cleanly
  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AuthContext]: SignOut error:', err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      localStorage.removeItem('ksp_selected_role');
      localStorage.removeItem('ksp_active_module');
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase authentication is not configured. Please define VITE_SUPABASE_ANON_KEY.');
    }

    const redirectUrl = `${window.location.origin}/login`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const value = {
    session,
    user,
    profile,
    role,
    isLoading,
    login,
    logout,
    resetPassword,
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
