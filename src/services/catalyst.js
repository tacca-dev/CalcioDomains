const CATALYST_BASE_URL = 'https://calciodomains-20105566495.development.catalystserverless.eu/server'

/**
 * Call getPrompt Catalyst Function
 * @param {string} domainName - The domain name to search
 * @returns {Promise<string>} The prompt string from the function
 */
export async function callGetPromptFunction(domainName) {
  try {
    const response = await fetch(`${CATALYST_BASE_URL}/get-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain: domainName })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Response should be just the prompt string
    return await response.text()
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
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
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
 * @returns {Promise<object>} The evaluation result from GPT
 */
export async function searchDomain(domainName) {
  // Step 1: Get the compiled prompt from Catalyst
  const prompt = await callGetPromptFunction(domainName)

  // Step 2: Call GPT-4o with the prompt
  const evaluation = await callGPT4o(prompt)

  return evaluation
}