import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CATALYST_ROLE_MAP,
  ROLE_DISPLAY_NAMES,
  checkCatalystAuth,
  signOutCatalyst,
  validateEmailForRole,
  isCatalystSDKAvailable
} from '../utils/catalystAuth';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [catalystUser, setCatalystUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Development mock auth flag (strictly defaults to false)
  const isMockAuthEnabled = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  /**
   * On application mount, verify whether the user already has an active Catalyst session
   */
  const checkInitialSession = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Check real Catalyst SDK session
      const authResult = await checkCatalystAuth();
      if (authResult && authResult.email && authResult.verifiedByCatalyst) {
        const detectedRole = CATALYST_ROLE_MAP[authResult.email.toLowerCase()];
        if (detectedRole) {
          setCatalystUser(authResult.raw);
          setRole(detectedRole);
          setCurrentUser({
            email: authResult.email,
            name: authResult.name || ROLE_DISPLAY_NAMES[detectedRole],
            role: detectedRole,
            roleName: ROLE_DISPLAY_NAMES[detectedRole],
          });
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }

      // 2. Explicit development fallback ONLY when VITE_USE_MOCK_AUTH=true is configured
      if (isMockAuthEnabled) {
        console.warn('[CrimeIntel Auth] Running in explicit development mock mode (VITE_USE_MOCK_AUTH=true).');
        const savedRole = localStorage.getItem('ksp_dev_role');
        if (savedRole && (savedRole === 'officer' || savedRole === 'analyst' || savedRole === 'admin')) {
          setRole(savedRole);
          setCurrentUser({
            email: `crimeintel.${savedRole}@gmail.com`,
            name: ROLE_DISPLAY_NAMES[savedRole],
            role: savedRole,
            roleName: ROLE_DISPLAY_NAMES[savedRole],
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setRole(null);
          setCurrentUser(null);
        }
      } else {
        // Fail closed by default
        setIsAuthenticated(false);
        setRole(null);
        setCurrentUser(null);
      }
    } catch (err) {
      console.warn('[CrimeIntel Auth] Error verifying session:', err);
      setIsAuthenticated(false);
      setRole(null);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isMockAuthEnabled]);

  useEffect(() => {
    checkInitialSession();
  }, [checkInitialSession]);

  /**
   * Establish authenticated session ONLY after verified Catalyst authentication
   */
  const loginWithCatalystUser = useCallback((expectedRole, userDetails) => {
    if (!userDetails?.email) {
      throw new Error('User email is required to complete authentication.');
    }

    // Require verified Catalyst identity or explicit development mock mode
    if (!userDetails.verifiedByCatalyst && !isMockAuthEnabled) {
      throw new Error('Authentication rejected: Identity has not been verified by Zoho Catalyst.');
    }

    const validation = validateEmailForRole(userDetails.email, expectedRole);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const assignedRole = validation.role;
    setCatalystUser(userDetails.raw || null);
    setRole(assignedRole);
    setCurrentUser({
      email: userDetails.email,
      name: userDetails.name || ROLE_DISPLAY_NAMES[assignedRole],
      role: assignedRole,
      roleName: ROLE_DISPLAY_NAMES[assignedRole],
      station: userDetails.station || (assignedRole === 'officer' ? 'Cubbon Park PS' : 'Command HQ'),
    });
    setIsAuthenticated(true);

    if (isMockAuthEnabled) {
      localStorage.setItem('ksp_dev_role', assignedRole);
    }
  }, [isMockAuthEnabled]);

  /**
   * Complete sign-out from Zoho Catalyst and clear application state
   */
  const logout = useCallback(async () => {
    try {
      await signOutCatalyst();
    } catch (err) {
      console.warn('[CrimeIntel Auth] Catalyst sign out error:', err);
    }

    setCatalystUser(null);
    setCurrentUser(null);
    setRole(null);
    setIsAuthenticated(false);

    if (isMockAuthEnabled) {
      localStorage.removeItem('ksp_dev_role');
    }

    localStorage.removeItem('ksp_active_module');
  }, [isMockAuthEnabled]);

  const value = {
    currentUser,
    catalystUser,
    role,
    isAuthenticated,
    isLoading,
    loginWithCatalystUser,
    logout,
    refreshAuth: checkInitialSession,
    isCatalystSDKAvailable: isCatalystSDKAvailable(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
