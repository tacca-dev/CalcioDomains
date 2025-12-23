import { ENV } from '@/config/environment'

// Catalyst Backend URL
const CATALYST_BASE_URL = ENV.CATALYST_BASE_URL

// Token storage
let accessToken = null
let tokenExpiry = null

/**
 * Authenticate with Freename API via Catalyst backend
 * @returns {Promise<string>} The access token
 */
export async function authenticateFreename() {
  // Check if we have a valid token already
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await fetch(`${CATALYST_BASE_URL}/authenticate-freename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Catalyst wraps the response in an "output" field as a JSON string
    const parsedOutput = JSON.parse(data.output)

    if (parsedOutput.error) {
      throw new Error(parsedOutput.error)
    }

    // Store token and calculate expiry time (subtract 60 seconds for safety margin)
    accessToken = parsedOutput.access_token
    tokenExpiry = Date.now() + (parsedOutput.expires_in - 60) * 1000

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

/**
 * Search for domain availability on Freename via Catalyst backend
 * @param {string[]} domains - Array of domain names to search (e.g., ["asti.calcio", "juventus.calcio"])
 * @returns {Promise<object>} Search results from Freename API
 */
export async function searchDomains(domains) {
  try {
    const token = await getValidToken()

    // Call Catalyst search-freename-domains function
    const response = await fetch(`${CATALYST_BASE_URL}/search-freename-domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        domains: domains
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Catalyst wraps the response in an "output" field as a JSON string
    const parsedOutput = JSON.parse(data.output)

    if (parsedOutput.error) {
      throw new Error(parsedOutput.error)
    }

    return parsedOutput

  } catch (error) {
    console.error('Error searching domains on Freename:', error)
    throw error
  }
}
