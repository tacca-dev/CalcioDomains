import './assets/main.css'

import { createApp } from 'vue'
/** LOGIN AUTH0 - START */
import { createAuth0 } from '@auth0/auth0-vue'
/** LOGIN AUTH0 - END */
import App from './App.vue'
import router from './router'

const app = createApp(App)

/** LOGIN AUTH0 - START */
// Configure Auth0 with Management API access
app.use(
  createAuth0({
    domain: "logintest-calcio-domains.eu.auth0.com",
    clientId: "ZPcqBmlnc2CUaXJLQCfvNUkTEtMAZLCh",
    authorizationParams: {
      redirect_uri: window.location.origin + '/',
      audience: 'https://logintest-calcio-domains.eu.auth0.com/api/v2/',
      scope: 'openid profile email read:current_user update:current_user_metadata create:current_user_metadata'
    }
  })
)
/** LOGIN AUTH0 - END */

app.use(router)

app.mount('#app')
