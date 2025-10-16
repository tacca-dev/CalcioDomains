// Catalyst Native Authentication Service

/**
 * Wait for Catalyst SDK to be loaded with retry mechanism
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<boolean>}
 */
async function waitForCatalystSDK(maxRetries = 10, delay = 200) {
  for (let i = 0; i < maxRetries; i++) {
    if (typeof window.catalyst !== 'undefined' && window.catalyst.auth) {
      console.log('[Auth] Catalyst SDK loaded successfully');
      return true;
    }
    console.log(`[Auth] Waiting for Catalyst SDK... attempt ${i + 1}/${maxRetries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  console.error('[Auth] Catalyst SDK failed to load after', maxRetries, 'attempts');
  return false;
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    // Wait for catalyst SDK to be loaded with retry
    const sdkLoaded = await waitForCatalystSDK();
    if (!sdkLoaded) {
      console.warn('[Auth] Catalyst SDK not available');
      return false;
    }

    console.log('[Auth] Checking authentication status...');
    const isAuth = await window.catalyst.auth.isUserAuthenticated();
    console.log('[Auth] Authentication status:', isAuth);
    return isAuth;
  } catch (error) {
    console.error('[Auth] Error checking authentication:', error);
    return false;
  }
}

/**
 * Get current user details
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  try {
    // Wait for catalyst SDK to be loaded
    const sdkLoaded = await waitForCatalystSDK();
    if (!sdkLoaded) {
      console.warn('[Auth] Catalyst SDK not available for getCurrentUser');
      return null;
    }

    const isAuth = await window.catalyst.auth.isUserAuthenticated();
    if (!isAuth) {
      console.log('[Auth] User not authenticated, no user details available');
      return null;
    }

    // Get user details using Catalyst SDK
    console.log('[Auth] Fetching current user details...');
    const userDetails = await window.catalyst.auth.getCurrentUser();
    console.log('[Auth] User details:', userDetails);
    return userDetails;
  } catch (error) {
    console.error('[Auth] Error getting current user:', error);
    return null;
  }
}

/**
 * Sign in using Catalyst hosted authentication
 * This redirects to the Catalyst hosted login page
 */
export function signIn() {
  try {
    if (typeof window.catalyst === 'undefined') {
      console.error('Catalyst SDK not loaded');
      return;
    }

    // Redirect to Catalyst hosted login page
    const loginURL = '/__catalyst/auth/login';
    window.location.href = loginURL;
  } catch (error) {
    console.error('Error during sign in:', error);
  }
}

/**
 * Sign out the current user
 * Redirects to login page after logout
 */
export function signOut() {
  try {
    if (typeof window.catalyst === 'undefined') {
      console.error('Catalyst SDK not loaded');
      return;
    }

    // Redirect to login page after logout
    const redirectURL = window.location.protocol + '//' + window.location.hostname + '/__catalyst/auth/login';
    window.catalyst.auth.signOut(redirectURL);
  } catch (error) {
    console.error('Error during sign out:', error);
  }
}