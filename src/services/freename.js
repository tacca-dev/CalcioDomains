// Freename API Configuration - fallback to hardcoded if .env not available (production)
const FREENAME_BASE_URL = import.meta.env.VITE_FREENAME_BASE_URL || process.env.FREENAME_BASE_URL || 'https://apis.freename.io'

const FREENAME_INITIAL_TOKEN = import.meta.env.VITE_FREENAME_INITIAL_TOKEN || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InhJYTdTZDFKZThxU01ZaHY4WVhaYSJ9.eyJpc3MiOiJodHRwczovL2ZyZWVuYW1lLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJsS1hYa1FpS3hmRFdyTmUzYWtnSEFOQWxZS0tiTWNVMkBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9hdXRoMC8iLCJpYXQiOjE3NTk3MzEyNTQsImV4cCI6MTc2MjMyMzI1NCwic2NvcGUiOiJyZWFkIEFkbWluIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoibEtYWGtRaUt4ZkRXck5lM2FrZ0hBTkFsWUtLYk1jVTIiLCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwiQWRtaW4iXX0.h4MWXWLN2r0YqNTjC8DxSzB6l9LfKVAQklHX_IyU96iIJupH93lJbzHZ0okajW666f9LC3AO3jGSJfEZ2COMNH1piYNyNgVRnzqM7l0hk8g5oYV_c9BHaBARLwd-LqMeCbN1U6xa2BSjXUIQd-yDm1qCj5hFlT8b199HdltpBq3S9HJ2XrHPUN0_Yu70Ik2GXc1TW0uYLPry4H5arlq4rE9wnVALeH99QjiAb86ScATsL-C5PS3Q4oyOCl2n6lrpRmLAdWhzeDa2toDrmr3eUeKpo1nfeJ5umEfo-jc-KdgHtzBdFAdr6MuV5iKWgrrYg_LW9Wga2Vb3yY5Ot5lPDQ'

const FREENAME_USERNAME = import.meta.env.VITE_FREENAME_USERNAME || process.env.FREENAME_USERNAME || 'operations@simplify-europe.co.uk'

const FREENAME_PASSWORD = import.meta.env.VITE_FREENAME_PASSWORD || process.env.FREENAME_PASSWORD || '5&.B,(IgE.lbE[#5'

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
        'Authorization': `Bearer ${FREENAME_INITIAL_TOKEN}`
      },
      body: JSON.stringify({
        username: FREENAME_USERNAME,
        password: FREENAME_PASSWORD
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
 * Search for domain availability on Freename
 * @param {string[]} domains - Array of domain names to search (e.g., ["asti.calcio", "juventus.calcio"])
 * @returns {Promise<object>} Search results from Freename API
 */
export async function searchDomains(domains) {
  try {
    const token = await getValidToken()

    // Join domains with space and encode with encodeURIComponent
    const searchString = domains.join(' ')

    // Call Freename search API with explicit URI encoding
    const response = await fetch(
      `${FREENAME_BASE_URL}/api/v1/reseller-logic/search?searchString=${encodeURIComponent(searchString)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Freename search failed: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Error searching domains on Freename:', error)
    throw error
  }
}
