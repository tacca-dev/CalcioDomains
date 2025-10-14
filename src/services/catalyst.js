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