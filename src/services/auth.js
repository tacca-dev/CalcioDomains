// Catalyst Native Authentication Service

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    // Wait for catalyst SDK to be loaded
    if (typeof window.catalyst === 'undefined') {
      console.warn('Catalyst SDK not yet loaded');
      return false;
    }

    const isAuth = await window.catalyst.auth.isUserAuthenticated();
    return isAuth;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get current user details
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  try {
    if (typeof window.catalyst === 'undefined') {
      return null;
    }

    const isAuth = await window.catalyst.auth.isUserAuthenticated();
    if (!isAuth) {
      return null;
    }

    // Get user details using Catalyst SDK
    const userDetails = await window.catalyst.auth.getCurrentUser();
    return userDetails;
  } catch (error) {
    console.error('Error getting current user:', error);
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