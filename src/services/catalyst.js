const CATALYST_BASE_URL = 'https://calciodomains-20105566495.development.catalystserverless.eu/server'

// OpenAI API Key - fallback to hardcoded if .env not available (production)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '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'

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
 * Call OpenAI GPT-4o API
 * @param {string} prompt - The prompt to send to GPT
 * @returns {Promise<object>} The parsed JSON response from GPT
 */
export async function callGPT4o(prompt) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    let gptResponse = data.choices[0].message.content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    // Parse the JSON response from GPT
    return JSON.parse(gptResponse)
  } catch (error) {
    console.error('Error calling GPT-4o:', error)
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