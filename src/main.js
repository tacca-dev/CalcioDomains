import './assets/main.css'

import { createApp } from 'vue'
import { createAuth0 } from '@auth0/auth0-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Configure Auth0
app.use(
  createAuth0({
    domain: "dev-giylww0unln6dunq.eu.auth0.com",
    clientId: "NIy1nFN8CeX42nrWAvB6jk2KNhNO77gG",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
)

app.use(router)

app.mount('#app')
