<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
</script>

<template>
  <section class="py-32 relative overflow-hidden bg-white">
    <div class="absolute inset-0 bg-gray-100"></div>
    <div class="absolute inset-0">
      <div
        v-for="i in 30"
        :key="i"
        class="absolute w-2 h-2 bg-gray-300 rounded-full animate-ping"
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
          class="text-lg px-12 py-6 bg-black text-white font-bold transform hover:scale-110 transition-all duration-300 shadow-2xl shadow-gray-500/25"
        >
          COMMENCER GRATUITEMENT
          <ArrowRight class="ml-3 h-6 w-6" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          class="text-lg px-12 py-6 border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transform hover:scale-110 transition-all duration-300 bg-transparent"
        >
          PLANIFIER UNE DÉMO
        </Button>
      </div>
    </div>
  </section>
</template>
