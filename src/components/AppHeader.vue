<script setup lang="ts">
import { ref, onMounted } from "vue"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-vue-next"

const isVisible = ref(false)

onMounted(() => {
  isVisible.value = true
})
</script>

<template>
  <header class="border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <div
        class="flex items-center space-x-3 transition-all duration-1000"
        :class="isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'"
      >
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
          <Building2 class="h-5 w-5 text-black" />
        </div>
        <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          PointID
        </span>
      </div>

      <nav class="hidden md:flex items-center space-x-8">
        <a
          v-for="(item, index) in ['Fonctionnalités', 'Utilisateurs', 'Témoignages', 'Contact']"
          :key="item"
          :href="`#${item.toLowerCase()}`"
          class="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
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
        <Button variant="ghost" class="text-gray-400 hover:text-white hover:bg-gray-800">
          Se connecter
        </Button>
        <Button class="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-black font-semibold">
          S'inscrire
        </Button>
      </div>
    </div>
  </header>
</template>
