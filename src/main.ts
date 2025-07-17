import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import apolloClient from './apollo-client'
import { provideApolloClient } from '@vue/apollo-composable'
import { useAuthStore } from './stores/auth'
import { useSocietaireStore } from './stores/societaire'

const app = createApp(App)

provideApolloClient(apolloClient)

app.use(createPinia())
app.use(router)

// Initialize auth stores after mounting
const authStore = useAuthStore()
const societaireStore = useSocietaireStore()

authStore.initAuth()
societaireStore.initAuth()

app.mount('#app')