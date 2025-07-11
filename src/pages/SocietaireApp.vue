<script setup lang="ts">
import { computed } from 'vue'
import SocietaireLogin from './SocietaireLogin.vue'
import SocietaireDashboard from './SocietaireDashboard.vue'
import { useSocietaireStore } from '@/stores/societaire'

const societaireStore = useSocietaireStore()

const isLoggedIn = computed(() => !!societaireStore.tokens)

const handleLogout = () => {
  societaireStore.logout()
}
</script>

<template>
  <div v-if="!isLoggedIn">
    <SocietaireLogin />
  </div>
  <div v-else>
    <SocietaireDashboard @logout="handleLogout" />
  </div>
</template>
