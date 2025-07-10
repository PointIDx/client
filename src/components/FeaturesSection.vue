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
  { icon: Clock, title: 'Suivi en temps réel', color: 'blue' },
  { icon: MessageSquare, title: 'Communication intégrée', color: 'green' },
  { icon: Camera, title: 'Gestion documentaire', color: 'purple' },
  { icon: MapPin, title: 'Géolocalisation', color: 'orange' },
  { icon: FileText, title: 'Rapports automatisés', color: 'red' },
  { icon: TrendingUp, title: 'Analytics avancés', color: 'indigo' },
]
</script>

<template>
  <section id="fonctionnalites" class="py-32 bg-black relative">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <h2 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          FONCTIONNALITÉS
          <br />
          AVANCÉES
        </h2>
        <p class="text-xl text-gray-400 max-w-3xl mx-auto">
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
              ? `border-${feature.color}-500/50 bg-${feature.color}-900/20 shadow-2xl shadow-${feature.color}-500/20`
              : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
          "
        >
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500"
            :class="
              activeFeature === index
                ? `bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-400 scale-110`
                : `bg-gray-800 group-hover:bg-${feature.color}-900/50`
            "
          >
            <component
              :is="feature.icon"
              class="h-10 w-10 transition-colors duration-500"
              :class="activeFeature === index ? 'text-black' : `text-${feature.color}-400`"
            />
          </div>
          <h3
            class="text-xl font-bold mb-3 transition-colors duration-500"
            :class="activeFeature === index ? `text-${feature.color}-300` : 'text-white'"
          >
            {{ feature.title.toUpperCase() }}
          </h3>
          <p class="text-gray-400 leading-relaxed">
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
