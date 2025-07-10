import './assets/main.css'

import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupWorker } from 'msw/browser'
import { handlers } from './mocks/handlers'
import apolloClient from './apollo-client'
import { DefaultApolloClient } from '@vue/apollo-composable'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const worker = setupWorker(...handlers)

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and running.
  return worker.start()
}

  const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App)
})

app.use(createPinia())
app.use(router)

enableMocking().then(() => {
  app.mount('#app')
})