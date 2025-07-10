<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
</script>

<template>
  <section class="py-32 relative overflow-hidden bg-gray-50">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-cyan-100/50 to-blue-100/50"></div>
    <div class="absolute inset-0">
      <div
        v-for="i in 30"
        :key="i"
        class="absolute w-2 h-2 bg-blue-200/50 rounded-full animate-ping"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }"
      />
    </div>

    <div class="container mx-auto px-4 text-center relative z-10">
      <h2 class="text-4xl md:text-6xl font-bold mb-8 text-gray-900">
        PRÊT À TRANSFORMER
        <br />
        VOTRE GESTION ?
      </h2>
      <p class="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
        Rejoignez des centaines de professionnels qui font déjà confiance à PointID.
      </p>
      <div class="flex flex-col sm:flex-row gap-6 justify-center">
        <Button
          size="lg"
          class="text-lg px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-bold transform hover:scale-110 transition-all duration-300 shadow-2xl shadow-cyan-500/25"
        >
          COMMENCER GRATUITEMENT
          <ArrowRight class="ml-3 h-6 w-6" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          class="text-lg px-12 py-6 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transform hover:scale-110 transition-all duration-300 bg-transparent"
        >
          PLANIFIER UNE DÉMO
        </Button>
      </div>
    </div>
  </section>
</template>
