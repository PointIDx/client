<script setup lang="ts">
import { ref, onMounted } from "vue"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, ChevronDown } from "lucide-vue-next"

const isVisible = ref(false)

onMounted(() => {
  isVisible.value = true
})
</script>

<template>
  <section class="py-32 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-white to-cyan-100/20"></div>
    <div class="absolute inset-0">
      <div
        v-for="i in 50"
        :key="i"
        class="absolute w-1 h-1 bg-blue-600/30 rounded-full animate-pulse"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        }"
      />
    </div>

    <div class="container mx-auto px-4 text-center relative z-10">
      <div
        class="transition-all duration-1000"
        :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'"
      >
        <Badge class="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 text-sm px-4 py-2">
          <span class="animate-pulse mr-2">●</span>
          Plateforme de gestion des sinistres
        </Badge>

        <h1 class="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          <span class="block mb-2">SIMPLIFIEZ LA</span>
          <span class="block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
            GESTION
          </span>
          <span class="block mt-2">DE VOS SINISTRES</span>
        </h1>

        <p class="text-xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
          La première plateforme qui connecte <span class="text-blue-700 font-semibold">assureurs</span>,
          <span class="text-green-700 font-semibold">prestataires</span> et
          <span class="text-purple-700 font-semibold">sociétaires</span> pour un suivi transparent et efficace
          des dossiers sinistres.
        </p>

        <div class="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button
            size="lg"
            class="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-black font-semibold transform hover:scale-105 transition-all duration-300"
          >
            COMMENCER GRATUITEMENT
            <ArrowRight class="ml-3 h-6 w-6" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            class="text-lg px-10 py-6 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 transform hover:scale-105 transition-all duration-300 bg-transparent"
          >
            <Play class="mr-3 h-6 w-6" />
            VOIR LA DÉMO
          </Button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-gray-700">
          <div
            v-for="(stat, index) in [
              { value: '500+', label: 'Prestataires actifs', color: 'blue', delay: '0ms' },
              { value: '50+', label: 'Assureurs partenaires', color: 'green', delay: '200ms' },
              { value: '10k+', label: 'Dossiers traités', color: 'purple', delay: '400ms' },
              { value: '98%', label: 'Satisfaction client', color: 'orange', delay: '600ms' },
            ]"
            :key="index"
            class="text-center transform transition-all duration-1000 hover:scale-110 text-gray-700"
            :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'"
            :style="{ transitionDelay: stat.delay }"
          >
            <div
              class="text-4xl font-bold mb-2"
              :class="`text-${stat.color}-700`"
            >
              {{ stat.value }}
            </div>
            <div class="text-gray-600 text-sm uppercase tracking-wider">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown class="h-8 w-8 text-gray-700" />
      </div>
    </div>
  </section>
</template>
