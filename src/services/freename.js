// Freename API Base URL - Replace with actual URL provided by Freename
const FREENAME_BASE_URL = import.meta.env.VITE_FREENAME_BASE_URL || 'https://api.freename.io'

// Token storage
let accessToken = null
let tokenExpiry = null

/**
 * Authenticate with Freename API
 * @returns {Promise<string>} The access token
 */
export async function authenticateFreename() {
  // Check if we have a valid token already
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await fetch(`${FREENAME_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_FREENAME_INITIAL_TOKEN}`
      },
      body: JSON.stringify({
        username: import.meta.env.VITE_FREENAME_USERNAME,
        password: import.meta.env.VITE_FREENAME_PASSWORD
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Freename authentication failed: ${response.status} - ${errorData}`)
    }

    const data = await response.json()

    // Store token and calculate expiry time (subtract 60 seconds for safety margin)
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000

    console.log('Freename authentication successful')
    return accessToken

  } catch (error) {
    console.error('Error authenticating with Freename:', error)
    throw error
  }
}

/**
 * Get a valid access token (authenticate if needed)
 * @returns {Promise<string>} Valid access token
 */
export async function getValidToken() {
  return await authenticateFreename()
}
