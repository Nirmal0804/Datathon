/**
 * Zoho Catalyst Authentication & Role Mapping Utility
 * Supports Zoho Catalyst Web SDK v4 (Embedded & BaaS Native Authentication)
 */

// Confirmed Zoho Catalyst Application Users & Role Mappings
export const CATALYST_ROLE_MAP = {
  'crimeintel.officer@gmail.com': 'officer',
  'crimeintel.analystt@gmail.com': 'analyst',
  'crimeintel.admin@gmail.com': 'admin',
};

export const ROLE_DISPLAY_NAMES = {
  officer: 'Field Officer',
  analyst: 'Intelligence Analyst',
  admin: 'System Administrator',
};

export const EXPECTED_EMAILS = {
  officer: 'crimeintel.officer@gmail.com',
  analyst: 'crimeintel.analystt@gmail.com',
  admin: 'crimeintel.admin@gmail.com',
};

/**
 * Check if the Catalyst Web SDK has been loaded and initialized in the browser
 */
export function isCatalystSDKAvailable() {
  return typeof window !== 'undefined' && Boolean(window.catalyst?.auth);
}

/**
 * Validate that an email matches the intended CrimeIntel role
 */
export function validateEmailForRole(email, expectedRole) {
  if (!email || !expectedRole) return { valid: false, reason: 'Missing email or role' };
  
  const normalizedEmail = email.trim().toLowerCase();
  const assignedRole = CATALYST_ROLE_MAP[normalizedEmail];

  if (!assignedRole) {
    return {
      valid: false,
      reason: `The account "${normalizedEmail}" is not authorized for this platform.`
    };
  }

  if (assignedRole !== expectedRole) {
    const roleName = ROLE_DISPLAY_NAMES[expectedRole] || expectedRole;
    return {
      valid: false,
      reason: `Account mismatch. Please sign in using the account assigned to the ${roleName} role.`
    };
  }

  return { valid: true, role: assignedRole };
}

/**
 * Check if a user is currently authenticated via Zoho Catalyst Web SDK
 * Resolves with verified user object or null
 */
export async function checkCatalystAuth() {
  if (!isCatalystSDKAvailable()) {
    return null;
  }

  try {
    const isAuth = await window.catalyst.auth.isUserAuthenticated();
    if (isAuth && typeof isAuth === 'object') {
      const user = isAuth.content || isAuth;
      const email = user.email_id || user.email || user.user_name || '';
      return {
        raw: user,
        email: email.trim().toLowerCase(),
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || email,
        role: CATALYST_ROLE_MAP[email.trim().toLowerCase()] || null,
        verifiedByCatalyst: true,
      };
    }
    return null;
  } catch (err) {
    // Unauthenticated or network error - fail closed
    return null;
  }
}

/**
 * Authenticate credentials against Zoho Catalyst Native Authentication
 */
export async function authenticateCatalystUser(email, password, expectedRole) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Role-to-email pre-check
  const roleCheck = validateEmailForRole(normalizedEmail, expectedRole);
  if (!roleCheck.valid) {
    return { success: false, error: roleCheck.reason };
  }

  // 2. Dispatch authentication to Catalyst Native Auth endpoints
  try {
    // Attempt standard Catalyst BaaS / Native Auth login endpoints
    const endpoints = [
      '/__catalyst/auth/login',
      '/baas/v1/auth/login',
    ];

    let authResponse = null;
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email_id: normalizedEmail,
            user_name: normalizedEmail,
            password: password,
          }),
        });

        if (res.ok) {
          authResponse = await res.json();
          break;
        } else if (res.status === 401 || res.status === 400) {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            error: errData.message || 'Invalid credentials. Password verification failed in Catalyst.',
          };
        }
      } catch {
        // Continue checking next endpoint or SDK session
      }
    }

    // Check if session was established or if SDK is active
    if (isCatalystSDKAvailable()) {
      const verifiedSession = await checkCatalystAuth();
      if (verifiedSession && verifiedSession.email) {
        if (verifiedSession.email !== normalizedEmail) {
          await signOutCatalyst();
          return {
            success: false,
            error: `Account mismatch. Please sign in using the account assigned to the ${ROLE_DISPLAY_NAMES[expectedRole]} role.`,
          };
        }
        return { success: true, user: verifiedSession };
      }
    }

    if (authResponse && (authResponse.status === 'success' || authResponse.content)) {
      const user = authResponse.content || authResponse;
      const userEmail = (user.email_id || user.email || user.user_name || normalizedEmail).toLowerCase();
      
      if (userEmail !== normalizedEmail) {
        await signOutCatalyst();
        return {
          success: false,
          error: `Account mismatch. Please sign in using the account assigned to the ${ROLE_DISPLAY_NAMES[expectedRole]} role.`,
        };
      }

      return {
        success: true,
        user: {
          raw: user,
          email: userEmail,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || ROLE_DISPLAY_NAMES[expectedRole],
          role: expectedRole,
          verifiedByCatalyst: true,
        },
      };
    }

    // If Catalyst endpoints return 404 or are unreachable in standalone Vite
    return {
      success: false,
      error: 'Catalyst Authentication Service Unavailable. Run through Catalyst environment (catalyst serve) or deploy to Catalyst.',
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || 'Authentication failed. Please verify your Catalyst credentials.',
    };
  }
}

/**
 * Render Catalyst Embedded Sign-In widget into a target container
 */
export function renderCatalystSignIn(elementId, config = {}) {
  if (!isCatalystSDKAvailable()) {
    return false;
  }

  try {
    window.catalyst.auth.signIn(elementId, {
      ...config,
    });
    return true;
  } catch (err) {
    console.error('[Catalyst Auth] Error rendering embedded sign-in:', err);
    return false;
  }
}

/**
 * Sign out of active Catalyst session
 */
export async function signOutCatalyst() {
  if (isCatalystSDKAvailable() && typeof window.catalyst.auth.signOut === 'function') {
    try {
      await window.catalyst.auth.signOut();
    } catch (err) {
      console.warn('[Catalyst Auth] Sign out error:', err);
    }
  }
}
