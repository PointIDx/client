<script setup lang="ts">
import { ref } from 'vue'
import SocietaireLogin from './SocietaireLogin.vue'
import SocietaireDashboard from './SocietaireDashboard.vue'

interface User {
  email: string
  dossier: string
}

const user = ref<User | null>(null)

const handleLogin = (email: string, dossier: string) => {
  user.value = { email, dossier }
}

const handleLogout = () => {
  user.value = null
}
</script>

<template>
  <div v-if="!user">
    <SocietaireLogin @login="handleLogin" />
  </div>
  <div v-else>
    <SocietaireDashboard :user-email="user.email" :dossier-number="user.dossier" @logout="handleLogout" />
  </div>
</template>
