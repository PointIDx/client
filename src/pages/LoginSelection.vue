<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from 'vue-router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileText, ArrowRight } from "lucide-vue-next"
import Logo from '@/assets/logo.svg'

const router = useRouter()

const navigateToLogin = (type: 'societaire' | 'assureur' | 'prestataire') => {
  router.push({ name: 'login', params: { type } })
}

const loginTypes = [
  {
    type: 'prestataire',
    icon: FileText,
    iconBgClass: 'bg-gray-100',
    iconTextColorClass: 'text-gray-800',
    title: 'Prestataire',
    description: 'Entreprise de travaux, artisan, professionnel du bâtiment',
    details: [
      'Gérez vos interventions et missions en cours',
      'Accédez aux nouvelles opportunités',
      'Suivez vos chantiers en temps réel',
      'Communiquez avec les clients et assureurs'
    ],
    buttonText: 'Se connecter comme Prestataire',
    buttonVariant: 'default' as const
  },
  {
    type: 'assureur',
    icon: Shield,
    iconBgClass: 'bg-gray-200',
    iconTextColorClass: 'text-gray-800',
    title: 'Assureur',
    description: 'Compagnie d\'assurance, courtier, agent général',
    details: [
      'Gérez vos dossiers et clients',
      'Supervisez les interventions',
      'Accédez aux rapports détaillés',
      'Coordonnez avec les prestataires'
    ],
    buttonText: 'Se connecter comme Assureur',
    buttonVariant: 'outline' as const
  },
  {
    type: 'societaire',
    icon: Users,
    iconBgClass: 'bg-gray-300',
    iconTextColorClass: 'text-gray-800',
    title: 'Sociétaire',
    description: 'Particulier, client final, bénéficiaire',
    details: [
      'Suivez l\'avancement de votre dossier',
      'Ajoutez des photos et documents',
      'Communiquez avec les intervenants',
      'Consultez la timeline des interventions'
    ],
    buttonText: 'Se connecter comme Sociétaire',
    buttonVariant: 'outline' as const
  }
]

const hoverBgClass = (iconBgClass: string) => {
  if (iconBgClass.includes("gray-100")) return "group-hover:bg-gray-200"
  if (iconBgClass.includes("gray-200")) return "group-hover:bg-gray-300"
  if (iconBgClass.includes("gray-300")) return "group-hover:bg-gray-400"
  return iconBgClass.replace("-100", "-200")
}
</script>

<template>
  <div class="min-h-screen bg-white text-black font-mono py-8">
    <div class="container mx-auto max-w-4xl px-4">
      <div class="mb-8 text-center">
        <div class="flex items-center justify-center mb-6">
          <img :src="Logo" alt="PointID Logo" class="h-12" />
        </div>
        <h1 class="text-3xl font-bold text-black">Connexion</h1>
        <p class="mt-2 text-gray-700">Choisissez le type de compte pour vous connecter</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <Card 
          v-for="loginType in loginTypes" 
          :key="loginType.type"
          class="relative hover:shadow-lg transition-shadow cursor-pointer group border-gray-300 bg-white"
          @click="navigateToLogin(loginType.type as 'societaire' | 'assureur' | 'prestataire')"
        >
          <CardHeader class="text-center pb-4">
            <div
              class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors"
              :class="[loginType.iconBgClass, hoverBgClass(loginType.iconBgClass)]"
            >
              <component :is="loginType.icon" class="h-8 w-8" :class="loginType.iconTextColorClass" />
            </div>
            <CardTitle class="text-xl text-black">{{ loginType.title }}</CardTitle>
            <CardDescription class="text-gray-700">{{ loginType.description }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <h4 class="font-medium text-black">Vous pourrez :</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li v-for="(detail, i) in loginType.details" :key="i">• {{ detail }}</li>
              </ul>
            </div>

            <Button 
              class="w-full mt-6" 
              size="lg" 
              :variant="loginType.buttonVariant"
              :class="loginType.buttonVariant === 'default' ? 'bg-black text-white hover:bg-gray-800' : 'border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500'"
            >
              {{ loginType.buttonText }}
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div class="mt-12 text-center">
        <div class="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h3 class="text-lg font-semibold text-black mb-2">Pas encore de compte ?</h3>
          <p class="text-gray-700 mb-4">
            Créez votre compte professionnel pour accéder à la plateforme et gérer vos activités.
          </p>
          <Button 
            variant="ghost" 
            class="text-gray-700 hover:text-black"
            @click="router.push('/pro-registration')"
          >
            Créer un compte
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>