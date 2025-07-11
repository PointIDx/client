<script setup lang="ts">
import { ref, onMounted } from "vue"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-vue-next"
import { useRouter } from 'vue-router'
// import logo
import Logo from '@/assets/logo.svg'

const router = useRouter()
const isVisible = ref(false)

onMounted(() => {
  isVisible.value = true
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <header class="border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <img :src="Logo" alt="Logo" class="h-12"/>

      <nav class="hidden md:flex items-center space-x-8">
        <a
          v-for="(item, index) in ['Fonctionnalités', 'Utilisateurs', 'Témoignages', 'Contact']"
          :key="item"
          :href="`#${item.toLowerCase()}`"
          class="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
          :class="isVisible ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          {{ item }}
        </a>
      </nav>

      <div
        class="flex items-center space-x-4 transition-all duration-1000"
        :class="isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'"
      >
        <Button 
          variant="ghost" 
          class="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          @click="navigateTo('/login-selection')"
        >
          Se connecter
        </Button>
        <Button
          @click="navigateTo('/pro-registration')"
          class="bg-black text-white font-semibold"
        >
          S'inscrire
        </Button>
      </div>
    </div>
  </header>
</template>
