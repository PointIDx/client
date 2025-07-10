<script setup lang="ts">
import { ref, onMounted } from "vue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from "lucide-vue-next"

const emit = defineEmits(["login"])

const email = ref("")
const dossier = ref("")
const showDossier = ref(false)
const isLoading = ref(false)
const error = ref("")

const particles = ref<Array<{ style: Record<string, string> }>>([])

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

  // Simulation d'authentification
  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (email.value === "jean.dupont@email.com" && dossier.value === "DOS2024001") {
    emit("login", email.value, dossier.value)
  } else {
    error.value = "Identifiants incorrects. Vérifiez votre email et numéro de dossier."
  }

  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 font-mono">
    <!-- Animated background -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="(particle, i) in particles"
        :key="i"
        class="absolute w-1 h-1 bg-gray-400/20 rounded-full animate-pulse"
        :style="particle.style"
      />
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Header -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="flex items-center justify-center space-x-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
            <Building2 class="h-7 w-7 text-white" />
          </div>
          <span class="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            PointID
          </span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">ESPACE SOCIÉTAIRE</h1>
        <p class="text-gray-500">Accédez au suivi de votre dossier</p>
      </div>

      <Card class="bg-white/80 border-gray-200 backdrop-blur-sm shadow-2xl">
        <CardHeader class="text-center pb-6">
          <CardTitle class="text-xl font-bold text-gray-900">CONNEXION SÉCURISÉE</CardTitle>
          <CardDescription class="text-gray-500">
            Utilisez vos identifiants pour accéder à votre dossier
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email -->
            <div class="space-y-2">
              <Label for="email" class="text-gray-800 font-semibold flex items-center">
                <Mail class="h-4 w-4 mr-2 text-blue-500" />
                ADRESSE EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                v-model="email"
                placeholder="votre.email@exemple.com"
                required
                class="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            <!-- Numéro de dossier -->
            <div class="space-y-2">
              <Label for="dossier" class="text-gray-800 font-semibold flex items-center">
                <Lock class="h-4 w-4 mr-2 text-green-500" />
                NUMÉRO DE DOSSIER
              </Label>
              <div class="relative">
                <Input
                  id="dossier"
                  :type="showDossier ? 'text' : 'password'"
                  v-model="dossier"
                  placeholder="DOS2024XXX"
                  required
                  class="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20 pr-12 transition-all duration-300"
                />
                <button
                  type="button"
                  @click="showDossier = !showDossier"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors duration-300"
                >
                  <EyeOff v-if="showDossier" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Message d'erreur -->
            <div v-if="error" class="flex items-center space-x-2 text-red-600 bg-red-100/50 border border-red-300 rounded-lg p-3 animate-shake">
              <AlertCircle class="h-4 w-4 flex-shrink-0" />
              <span class="text-sm">{{ error }}</span>
            </div>

            <!-- Bouton de connexion -->
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-3 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div v-if="isLoading" class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>CONNEXION EN COURS...</span>
              </div>
              <span v-else>SE CONNECTER</span>
            </Button>
          </form>

          <!-- Identifiants de test -->
          <div class="mt-8 p-4 bg-gray-100/50 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-2 mb-3">
              <CheckCircle class="h-4 w-4 text-green-500" />
              <span class="text-sm font-semibold text-green-600">IDENTIFIANTS DE TEST</span>
            </div>
            <div class="space-y-2 text-sm text-gray-700">
              <div>
                <span class="text-gray-500">Email:</span>
                <code class="bg-gray-200 px-2 py-1 rounded text-blue-600">jean.dupont@email.com</code>
              </div>
              <div>
                <span class="text-gray-500">Dossier:</span>
                <code class="bg-gray-200 px-2 py-1 rounded text-green-600">DOS2024001</code>
              </div>
            </div>
          </div>

          <!-- Aide -->
          <div class="mt-6 text-center">
            <p class="text-gray-500 text-sm">
              Besoin d'aide ?
              <a href="#" class="text-blue-500 hover:text-blue-600 transition-colors duration-300 underline">
                Contactez votre assureur
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Sécurité -->
      <div class="mt-6 text-center">
        <Badge variant="outline" class="border-gray-300 text-gray-500">
          <Lock class="h-3 w-3 mr-1" />
          CONNEXION SÉCURISÉE SSL
        </Badge>
      </div>
    </div>
  </div>
</template>
