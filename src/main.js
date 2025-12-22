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
    domain: "dev-giylww0unln6dunq.eu.auth0.com",
    clientId: "NIy1nFN8CeX42nrWAvB6jk2KNhNO77gG",
    authorizationParams: {
      redirect_uri: window.location.origin + '/',
      audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
      scope: 'openid profile email read:current_user update:current_user_metadata create:current_user_metadata'
    }
  })
)
/** LOGIN AUTH0 - END */

app.use(router)

app.mount('#app')
