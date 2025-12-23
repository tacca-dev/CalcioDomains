// Rilevamento ambiente basato su hostname
const isProduction = window.location.hostname === 'app.calcio.domains'

export const ENV = {
  isProduction,

  // Auth0 Configuration
  AUTH0_DOMAIN: isProduction
    ? 'login-calcio-domains.eu.auth0.com'
    : 'logintest-calcio-domains.eu.auth0.com',
  AUTH0_CLIENT_ID: isProduction
    ? 'cVKUgnNAarzLA0G0WYgE57MYG7tduGj9'
    : 'ZPcqBmlnc2CUaXJLQCfvNUkTEtMAZLCh',
  AUTH0_AUDIENCE: isProduction
    ? 'https://login-calcio-domains.eu.auth0.com/api/v2/'
    : 'https://logintest-calcio-domains.eu.auth0.com/api/v2/',

  // Catalyst Configuration
  CATALYST_BASE_URL: isProduction
    ? 'https://calciodomains-20105566495.catalystserverless.eu/server'
    : 'https://calciodomains-20105566495.development.catalystserverless.eu/server'
}

// Helper per costruire URL Auth0 API
export const getAuth0ApiUrl = (path) => `https://${ENV.AUTH0_DOMAIN}${path}`

// Log ambiente al caricamento (solo in dev)
if (!isProduction) {
  console.log('🔧 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT')
  console.log('🔧 Auth0 Domain:', ENV.AUTH0_DOMAIN)
  console.log('🔧 Catalyst URL:', ENV.CATALYST_BASE_URL)
}