import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupWorker } from 'msw/browser'
import { handlers } from './mocks/handlers'
import apolloClient from './apollo-client'
import { provideApolloClient } from '@vue/apollo-composable'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const worker = setupWorker(...handlers)

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and running.
  return worker.start()
}

  const app = createApp(App)

provideApolloClient(apolloClient)

app.use(createPinia())
app.use(router)

enableMocking().then(() => {
  app.mount('#app')
})