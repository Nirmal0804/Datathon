/**
 * Zoho Catalyst Authentication & Role Mapping Utility
 * Supports Zoho Catalyst Web SDK v4 (Native Embedded Authentication)
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
 * Render Zoho Catalyst Embedded Sign-In widget into a target container
 */
export function renderCatalystSignIn(elementId, config = {}) {
  if (!isCatalystSDKAvailable()) {
    console.warn('[Catalyst Auth] Web SDK is not available in window.catalyst.auth');
    return false;
  }

  try {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      console.warn(`[Catalyst Auth] Target element #${elementId} not found in DOM.`);
      return false;
    }

    // Clean previous contents to prevent duplicate iframe instances
    targetElement.innerHTML = '';

    // Mount native Catalyst IAM embedded authentication iframe
    window.catalyst.auth.signIn(elementId, {
      service_url: '/app/index.html',
      always_render_login: true,
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
