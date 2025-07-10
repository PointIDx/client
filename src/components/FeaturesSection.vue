<script setup lang="ts">
import { ref, onMounted } from "vue"
import { Clock, MessageSquare, Camera, MapPin, FileText, TrendingUp } from "lucide-vue-next"

const activeFeature = ref(0)

onMounted(() => {
  setInterval(() => {
    activeFeature.value = (activeFeature.value + 1) % 6
  }, 3000)
})

const features = [
  { icon: Clock, title: 'Suivi en temps réel', color: 'gray' },
  { icon: MessageSquare, title: 'Communication intégrée', color: 'gray' },
  { icon: Camera, title: 'Gestion documentaire', color: 'gray' },
  { icon: MapPin, title: 'Géolocalisation', color: 'gray' },
  { icon: FileText, title: 'Rapports automatisés', color: 'gray' },
  { icon: TrendingUp, title: 'Analytics avancés', color: 'gray' },
]
</script>

<template>
  <section id="fonctionnalites" class="py-32 bg-white relative">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <h2 class="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
          FONCTIONNALITÉS
          <br />
          AVANCÉES
        </h2>
        <p class="text-xl text-gray-700 max-w-3xl mx-auto">
          Tous les outils dont vous avez besoin pour gérer efficacement vos sinistres et interventions.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="text-center p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105"
          :class="
            activeFeature === index
              ? `border-gray-500/50 bg-gray-100/20 shadow-lg shadow-gray-500/20`
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          "
        >
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500"
            :class="
              activeFeature === index
                ? `bg-gray-500 scale-110`
                : `bg-gray-100 group-hover:bg-gray-100/50`
            "
          >
            <component
              :is="feature.icon"
              class="h-10 w-10 transition-colors duration-500"
              :class="activeFeature === index ? 'text-white' : 'text-gray-600'"
            />
          </div>
          <h3
            class="text-xl font-bold mb-3 transition-colors duration-500"
            :class="activeFeature === index ? `text-gray-700` : 'text-gray-900'"
          >
            {{ feature.title.toUpperCase() }}
          </h3>
          <p class="text-gray-600 leading-relaxed">
            <span v-if="index === 0">Timeline détaillée de chaque étape du dossier avec notifications automatiques.</span>
            <span v-if="index === 1">Chat en temps réel entre tous les intervenants du dossier.</span>
            <span v-if="index === 2">Upload de photos, documents et commentaires pour enrichir le dossier.</span>
            <span v-if="index === 3">Localisation précise des interventions et optimisation des déplacements.</span>
            <span v-if="index === 4">Génération automatique de rapports et factures avec signature électronique.</span>
            <span v-if="index === 5">Tableaux de bord avec statistiques et indicateurs de performance.</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
