const CATALYST_BASE_URL = 'https://calciodomains-20105566495.development.catalystserverless.eu/server'

/**
 * Call getPrompt Catalyst Function
 * @param {string|null} domainName - The domain name to search (optional - if null, returns template)
 * @returns {Promise<{prompt: string, coefficients: object}>} The prompt (template or compiled) and coefficients
 */
export async function callGetPromptFunction(domainName = null) {
  try {
    const body = domainName ? { domain: domainName } : {}

    const response = await fetch(`${CATALYST_BASE_URL}/get-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Catalyst wraps the response in an "output" field as a JSON string
    // We need to parse it
    const parsedOutput = JSON.parse(data.output)

    return parsedOutput
  } catch (error) {
    console.error(`Error calling function getPrompt:`, error)
    throw error
  }
}

/**
 * Call evaluate-domain Catalyst Function (which calls OpenAI GPT-4o)
 * @param {string} prompt - The prompt to send to GPT
 * @returns {Promise<object>} The parsed JSON response from GPT
 */
export async function callGPT4o(prompt) {
  try {
    const response = await fetch(`${CATALYST_BASE_URL}/evaluate-domain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Catalyst wraps the response in an "output" field as a JSON string
    const parsedOutput = JSON.parse(data.output)

    return parsedOutput
  } catch (error) {
    console.error('Error calling evaluate-domain function:', error)
    throw error
  }
}

/**
 * Search for a domain: get prompt and call GPT-4o
 * @param {string} domainName - The domain name to search
 * @returns {Promise<{evaluation: object, coefficients: object}>} The evaluation result from GPT and coefficients
 */
export async function searchDomain(domainName) {
  // Step 1: Get the compiled prompt and coefficients from Catalyst
  const { prompt, coefficients } = await callGetPromptFunction(domainName)

  // Step 2: Call GPT-4o with the prompt
  const evaluation = await callGPT4o(prompt)

  return { evaluation, coefficients }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get user data from Catalyst database
 * @param {string} catalystRowId - User's ROWID in Catalyst users table
 * @returns {Promise<object>} User data object
 */
export async function getUserData(catalystRowId) {
  try {
    const response = await fetch(`${CATALYST_BASE_URL}/get-user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ catalystRowId })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Parse Catalyst output (can be string or already parsed)
    const parsedData = data.output
      ? (typeof data.output === 'string' ? JSON.parse(data.output) : data.output)
      : data

    if (!parsedData.success) {
      throw new Error(parsedData.error || 'Failed to get user data')
    }

    return parsedData.data
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

/**
 * Update user profile (name, nickname, avatar)
 * @param {FormData} formData - Form data with catalystRowId, name, nickname, and optional avatar file
 * @returns {Promise<object>} Update result
 */
export async function updateUserProfile(formData) {
  try {
    const response = await fetch(`${CATALYST_BASE_URL}/update-user`, {
      method: 'POST',
      body: formData
      // Note: Don't set Content-Type header - browser sets it with boundary for multipart/form-data
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to update profile')
    }

    return result
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Get avatar URL for a user
 * @param {string} catalystRowId - User's ROWID
 * @returns {string} Avatar URL with cache-busting timestamp
 */
export function getAvatarUrl(catalystRowId) {
  return `${CATALYST_BASE_URL}/get-avatar?rowId=${catalystRowId}&t=${Date.now()}`
}

// ============================================================================
// CART MANAGEMENT
// ============================================================================

/**
 * Add domain to user's cart
 * @param {string} userId - User's ROWID
 * @param {string} domainName - Domain name (e.g., "juventus.calcio")
 * @param {number} price - Final price
 * @param {string} category - Domain category
 * @returns {Promise<object>} Cart item data
 */
export async function addDomainToCart(userId, domainName, price, category) {
  try {
    const response = await fetch(`${CATALYST_BASE_URL}/add-to-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        domainName,
        price,
        category
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const parsedOutput = JSON.parse(data.output)

    if (!parsedOutput.success) {
      throw new Error(parsedOutput.error || 'Failed to add to cart')
    }

    return parsedOutput.data
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

/**
 * Get user's cart items
 * @param {string} userId - User's ROWID
 * @returns {Promise<Array>} Array of cart items
 */
export async function getUserCart(userId) {
  try {
    const response = await fetch(`${CATALYST_BASE_URL}/get-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const parsedOutput = JSON.parse(data.output)

    if (!parsedOutput.success) {
      throw new Error(parsedOutput.error || 'Failed to get cart')
    }

    return parsedOutput.items || []
  } catch (error) {
    console.error('Error getting cart:', error)
    throw error
  }
}

/**
 * Delete items from user's cart by domain names
 * @param {string} userId - User's ROWID
 * @param {string|Array<string>} domainNames - Single domain name or array of domain names to delete
 * @returns {Promise<Object>} Result with deletedCount and deletedDomains
 */
export async function deleteFromCart(userId, domainNames) {
  try {
    const response = await fetch(`${CATALYST_BASE_URL}/delete-from-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        domainNames: Array.isArray(domainNames) ? domainNames : [domainNames]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const parsedOutput = JSON.parse(data.output)

    if (!parsedOutput.success) {
      throw new Error(parsedOutput.error || 'Failed to delete from cart')
    }

    return {
      deletedCount: parsedOutput.deletedCount,
      deletedDomains: parsedOutput.deletedDomains
    }
  } catch (error) {
    console.error('Error deleting from cart:', error)
    throw error
  }
}