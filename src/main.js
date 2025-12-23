import './assets/main.css'

import { createApp } from 'vue'
/** LOGIN AUTH0 - START */
import { createAuth0 } from '@auth0/auth0-vue'
import { ENV } from './config/environment'
/** LOGIN AUTH0 - END */
import App from './App.vue'
import router from './router'

const app = createApp(App)

/** LOGIN AUTH0 - START */
// Configure Auth0 with Management API access (auto-detect dev/prod)
app.use(
  createAuth0({
    domain: ENV.AUTH0_DOMAIN,
    clientId: ENV.AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin + '/',
      audience: ENV.AUTH0_AUDIENCE,
      scope: 'openid profile email read:current_user update:current_user_metadata create:current_user_metadata'
    }
  })
)
/** LOGIN AUTH0 - END */

app.use(router)

app.mount('#app')
