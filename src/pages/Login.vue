<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter, useRoute } from 'vue-router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, Shield, Users, FileText } from "lucide-vue-next"
import Logo from '@/assets/logo.svg'
import { useSocietaireStore } from "@/stores/societaire"
import { useAuthStore } from "@/stores/auth"
import { useAssureurStore } from "@/stores/assureur"
import { usePrestataireStore } from "@/stores/prestataire"

const router = useRouter()
const route = useRoute()

// Get the login type from route params
const loginType = computed(() => route.params.type as 'societaire' | 'assureur' | 'prestataire')

// Stores
const societaireStore = useSocietaireStore()
const authStore = useAuthStore()
const assureurStore = useAssureurStore()
const prestataireStore = usePrestataireStore()

// Form fields
const email = ref("")
const password = ref("")
const dossier = ref("")
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref("")

// Computed for the dynamic input field
const inputValue = computed({
  get: () => loginType.value === 'societaire' ? dossier.value : password.value,
  set: (value: string) => {
    if (loginType.value === 'societaire') {
      dossier.value = value
    } else {
      password.value = value
    }
  }
})

const particles = ref<Array<{ style: Record<string, string> }>>([])

// Configuration for different login types
const loginConfig = computed(() => {
  switch (loginType.value) {
    case 'societaire':
      return {
        title: 'ESPACE SOCIÉTAIRE',
        subtitle: 'Accédez au suivi de votre dossier',
        icon: Users,
        color: 'black',
        fields: ['email', 'dossier'],
        gradient: 'from-black to-gray-800',
      }
    case 'assureur':
      return {
        title: 'ESPACE ASSUREUR',
        subtitle: 'Gérez vos dossiers et clients',
        icon: Shield,
        color: 'black',
        fields: ['email', 'password'],
        gradient: 'from-black to-gray-800',
      }
    case 'prestataire':
      return {
        title: 'ESPACE PRESTATAIRE',
        subtitle: 'Consultez vos missions',
        icon: FileText,
        color: 'black',
        fields: ['email', 'password'],
        gradient: 'from-black to-gray-800',
      }
    default:
      return {
        title: 'CONNEXION',
        subtitle: 'Accédez à votre espace',
        icon: Building2,
        color: 'black',
        fields: ['email', 'password'],
        gradient: 'from-black to-gray-800',
      }
  }
})

onMounted(() => {
  for (let i = 0; i < 20; i++) {
    particles.value.push({
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      },
    })
  }
})

const handleSubmit = async () => {
  error.value = ""
  isLoading.value = true

  try {
    let success = false

    switch (loginType.value) {
      case 'societaire':
        success = await societaireStore.login({ email: email.value, dossierNumber: dossier.value })
        if (success) {
          router.push({ name: 'societaire-dashboard' })
        }
        break
      case 'assureur':
        success = await authStore.login({ email: email.value, password: password.value, accountType: 'ASSUREUR' })
        if (success) {
          router.push({ name: 'assureur-dashboard' })
        }
        break
      case 'prestataire':
        success = await authStore.login({ email: email.value, password: password.value, accountType: 'PRESTATAIRE' })
        if (success) {
          router.push({ name: 'prestataire-dashboard' })
        }
        break
    }

    if (!success) {
      error.value = "Identifiants incorrects. Vérifiez vos informations de connexion."
    }
  } catch (err) {
    error.value = "Une erreur est survenue lors de la connexion."
  }

  isLoading.value = false
}

const goBack = () => {
  router.push({ name: 'login-selection' })
}
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4 font-mono">
    <!-- Animated background -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="(particle, i) in particles"
        :key="i"
        class="absolute w-1 h-1 bg-gray-300 rounded-full animate-pulse"
        :style="particle.style"
      />
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Header -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="flex items-center justify-center space-x-3 mb-4">
          <img :src="Logo" alt="PointID Logo" class="h-12" />
        </div>
        <h1 class="text-2xl font-bold text-black mb-2">{{ loginConfig.title }}</h1>
        <p class="text-gray-700">{{ loginConfig.subtitle }}</p>
        
        <!-- Back button -->
        <Button
          variant="outline"
          size="sm"
          @click="goBack"
          class="mt-4 text-black hover:text-gray-700 border-black hover:bg-gray-100"
        >
          ← Retour au choix
        </Button>
      </div>

      <Card class="bg-white border-gray-300 shadow-2xl">
        <CardHeader class="text-center pb-6">
          <CardTitle class="text-xl font-bold text-black">CONNEXION SÉCURISÉE</CardTitle>
          <CardDescription class="text-gray-700">
            Utilisez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email -->
            <div class="space-y-2">
              <Label for="email" class="text-black font-semibold flex items-center">
                <Mail class="h-4 w-4 mr-2 text-black" />
                ADRESSE EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                v-model="email"
                placeholder="votre.email@exemple.com"
                required
                class="bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/20 transition-all duration-300"
              />
            </div>

            <!-- Password or Dossier -->
            <div class="space-y-2">
              <Label :for="loginType === 'societaire' ? 'dossier' : 'password'" class="text-black font-semibold flex items-center">
                <Lock class="h-4 w-4 mr-2 text-black" />
                {{ loginType === 'societaire' ? 'NUMÉRO DE DOSSIER' : 'MOT DE PASSE' }}
              </Label>
              <div class="relative">
                <Input
                  :id="loginType === 'societaire' ? 'dossier' : 'password'"
                  :type="showPassword ? 'text' : 'password'"
                  :v-model="loginType === 'societaire' ? dossier : password"
                  :placeholder="loginType === 'societaire' ? 'DOS2024XXX' : '••••••••'"
                  required
                  class="bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/20 pr-12 transition-all duration-300"
                  v-model="inputValue"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-300"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Message d'erreur -->
            <div v-if="error" class="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-300 rounded-lg p-3">
              <AlertCircle class="h-4 w-4 flex-shrink-0" />
              <span class="text-sm">{{ error }}</span>
            </div>

            <!-- Bouton de connexion -->
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div v-if="isLoading" class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>CONNEXION EN COURS...</span>
              </div>
              <span v-else>SE CONNECTER</span>
            </Button>
          </form>

          <!-- Aide -->
          <div class="mt-6 text-center">
            <p class="text-gray-700 text-sm">
              Besoin d'aide ?
              <a href="#" class="text-black hover:text-gray-700 transition-colors duration-300 underline">
                {{ loginType === 'societaire' ? 'Contactez votre assureur' : 'Contactez le support' }}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Sécurité -->
      <div class="mt-6 text-center">
        <Badge variant="outline" class="border-gray-300 text-black">
          <Lock class="h-3 w-3 mr-1 text-black" />
          CONNEXION SÉCURISÉE SSL
        </Badge>
      </div>
    </div>
  </div>
</template>