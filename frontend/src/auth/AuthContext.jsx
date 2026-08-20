import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase.js';
import { fetchMe } from '../api/auth.js';

// Application authentication states.
export const AUTH_STATUS = {
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    status: SUPABASE_CONFIGURED ? AUTH_STATUS.AUTHENTICATING : AUTH_STATUS.UNAUTHENTICATED,
    session: null,
    user: null,
    me: null,          // backend-verified identity from /api/v1/auth/me
    meStatus: 'idle',  // 'idle' | 'verifying' | 'verified' | 'error'
  });

  const applySession = useCallback((session) => {
    setState(prev => ({
      ...prev,
      status: session ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED,
      session,
      user: session?.user ?? null,
      me: session ? prev.me : null,
      meStatus: session ? prev.meStatus : 'idle',
    }));
  }, []);

  // ── Session restore + subscription ───────────────────────────────────────
  useEffect(() => {
    if (!supabase) return undefined;

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  // ── Backend identity verification ────────────────────────────────────────
  // Any time a real session exists, confirm the backend accepts it via
  // GET /api/v1/auth/me. A 401 means the backend rejected the token →
  // sign out so the UI returns to unauthenticated.
  const accessToken = state.session?.access_token ?? null;
  useEffect(() => {
    if (!accessToken || !supabase) return undefined;

    let cancelled = false;
    setState(prev => ({ ...prev, meStatus: 'verifying' }));

    fetchMe()
      .then((me) => {
        if (cancelled) return;
        setState(prev => ({ ...prev, me, meStatus: 'verified' }));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err && err.status === 401) {
          supabase.auth.signOut();
        } else {
          setState(prev => ({ ...prev, meStatus: 'error' }));
        }
      });

    return () => { cancelled = true; };
  }, [accessToken]);

  // ── Sign in with real Supabase credentials ───────────────────────────────
  const signIn = useCallback(async (email, password) => {
    if (!supabase) {
      const error = new Error('Authentication is not configured for this deployment.');
      error.code = 'AUTH_NOT_CONFIGURED';
      throw error;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  // ── Sign out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // onAuthStateChange flips status to unauthenticated and clears session.
  }, []);

  const value = useMemo(
    () => ({
      status: state.status,
      session: state.session,
      user: state.user,
      me: state.me,
      meStatus: state.meStatus,
      isAuthenticated: state.status === AUTH_STATUS.AUTHENTICATED,
      isAuthenticating: state.status === AUTH_STATUS.AUTHENTICATING,
      signIn,
      signOut,
    }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}