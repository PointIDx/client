<script setup lang="ts">
import { Building2, Shield, User, CheckCircle } from "lucide-vue-next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'vue-router'

const router = useRouter()

const userTypes = [
  {
    icon: Building2,
    title: 'PRESTATAIRES',
    subtitle: 'Artisans, entreprises de travaux, professionnels du bâtiment',
    color: 'blue',
    features: [
      'Gestion centralisée des missions',
      'Suivi en temps réel des interventions',
      'Communication directe avec les clients',
      'Gestion documentaire simplifiée',
    ],
    cta: 'REJOINDRE COMME PRESTATAIRE',
  },
  {
    icon: Shield,
    title: 'ASSUREURS',
    subtitle: "Compagnies d'assurance, courtiers, agents généraux",
    color: 'green',
    features: [
      'Création et suivi des missions',
      'Réseau de prestataires qualifiés',
      'Tableaux de bord analytiques',
      'Gestion des coûts optimisée',
    ],
    cta: 'REJOINDRE COMME ASSUREUR',
  },
  {
    icon: User,
    title: 'SOCIÉTAIRES',
    subtitle: 'Particuliers, propriétaires, bénéficiaires',
    color: 'purple',
    features: [
      'Suivi transparent du dossier',
      'Ajout de photos et commentaires',
      'Communication avec les intervenants',
      'Timeline des interventions',
    ],
    cta: 'ACCÉDER À MON DOSSIER',
  },
]

const handleNavigation = (user: any) => {
  if (user.cta === 'ACCÉDER À MON DOSSIER') {
    router.push('/societaire-login')
  }
}
</script>

<template>
  <section id="utilisateurs" class="py-32 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <h2 class="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
          UNE SOLUTION POUR
          <br />
          CHAQUE PROFESSIONNEL
        </h2>
        <p class="text-xl text-gray-700 max-w-3xl mx-auto">
          Que vous soyez prestataire, assureur ou sociétaire, notre plateforme s'adapte à vos besoins spécifiques.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <Card
          v-for="(user, index) in userTypes"
          :key="index"
          class="relative bg-white border-gray-200 transition-all duration-500 transform hover:scale-105 hover:shadow-lg group"
          :class="`hover:border-${user.color}-500/50 hover:shadow-${user.color}-500/20`"
        >
          <CardHeader class="text-center pb-6">
            <div
              class="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
              :class="`bg-gradient-to-br from-${user.color}-500 to-${user.color}-400`"
            >
              <component :is="user.icon" class="h-10 w-10 text-black" />
            </div>
            <CardTitle
              class="text-2xl font-bold text-gray-900"
            >
              {{ user.title }}
            </CardTitle>
            <CardDescription class="text-gray-600 text-base">{{ user.subtitle }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-4">
              <div
                v-for="(feature, featureIndex) in user.features"
                :key="featureIndex"
                class="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300"
                :style="{ transitionDelay: `${featureIndex * 100}ms` }"
              >
                <CheckCircle class="h-5 w-5 flex-shrink-0" :class="`text-${user.color}-400`" />
                <span class="text-gray-700">{{ feature }}</span>
              </div>
            </div>
            <Button
              @click="handleNavigation(user)"
              class="w-full mt-8 text-black font-semibold transform hover:scale-105 transition-all duration-300"
              :class="`bg-gradient-to-r from-${user.color}-600 to-${user.color}-500 hover:from-${user.color}-700 hover:to-${user.color}-600`"
              size="lg"
            >
              {{ user.cta }}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
