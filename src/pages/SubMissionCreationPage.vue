<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMissionStore } from '@/stores/mission'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Briefcase,
  Settings,
  AlertTriangle,
  CheckCircle,
  Euro,
  Clock,
  FileText,
  Save
} from 'lucide-vue-next'
import { useForm, Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SPECIALIZATIONS, UrgenceLevel } from '@/interfaces/sub-mission'
import type { SubMissionCreateInput } from '@/interfaces/sub-mission'

const route = useRoute()
const router = useRouter()
const missionStore = useMissionStore()
const authStore = useAuthStore()

const missionId = route.params.missionId as string
const isLoading = ref(false)
const submitError = ref('')

// Validation schema
const subMissionSchema = toTypedSchema(z.object({
  specialization: z.string().min(1, 'La spécialisation est requise'),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  urgence: z.nativeEnum(UrgenceLevel),
  estimatedCost: z.number().positive('Le coût doit être positif').optional().or(z.literal(0)),
  materialsNeeded: z.string().optional(),
  specialRequirements: z.string().optional(),
  accessRequirements: z.string().optional(),
  estimatedDurationHours: z.number().positive('La durée doit être positive').optional().or(z.literal(0))
}))

const { handleSubmit, values, setFieldValue, validate, errors } = useForm({
  validationSchema: subMissionSchema,
  initialValues: {
    specialization: '',
    title: '',
    description: '',
    urgence: UrgenceLevel.MOYENNE,
    estimatedCost: undefined,
    materialsNeeded: '',
    specialRequirements: '',
    accessRequirements: '',
    estimatedDurationHours: undefined
  }
})

// Helper function to get error styling for form fields
const getFieldErrorClass = (fieldName: string) => {
  return (errors.value as any)[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
}

// Load mission details
onMounted(async () => {
  try {
    await missionStore.fetchMissionDetails(missionId)
  } catch (error) {
    console.error('Error loading mission details:', error)
  }
})

const goBack = () => {
  router.push(`/mission/${missionId}`)
}

const onSubmit = handleSubmit(async (formData) => {
  if (authStore.user?.accountType !== 'ASSUREUR') {
    submitError.value = 'Seuls les assureurs peuvent créer des sous-missions'
    toast.error('Accès refusé', {
      description: 'Seuls les assureurs peuvent créer des sous-missions.',
      duration: 4000
    })
    return
  }

  isLoading.value = true
  submitError.value = ''

  try {
    const subMissionInput: SubMissionCreateInput = {
      missionId,
      title: formData.title,
      description: formData.description,
      specialization: formData.specialization,
      urgence: formData.urgence,
      estimatedCost: formData.estimatedCost,
      materialsNeeded: formData.materialsNeeded,
      specialRequirements: formData.specialRequirements,
      accessRequirements: formData.accessRequirements,
      estimatedDurationHours: formData.estimatedDurationHours
    }

    await missionStore.createSubMission(subMissionInput)
    
    toast.success('Sous-mission créée avec succès', {
      description: `"${formData.title}" a été ajoutée à la mission.`,
      duration: 3000
    })
    
    // Navigate back to mission details
    router.push(`/mission/${missionId}`)
  } catch (error) {
    console.error('Error creating sub-mission:', error)
    submitError.value = 'Erreur lors de la création de la sous-mission. Veuillez réessayer.'
    toast.error('Erreur lors de la création', {
      description: 'Impossible de créer la sous-mission. Veuillez vérifier vos informations et réessayer.',
      duration: 5000
    })
  } finally {
    isLoading.value = false
  }
}, (validationErrors) => {
  console.log('❌ Form validation failed:', validationErrors)
  console.log('Current form values:', values)
  
  // Show detailed error toast
  const errorFields = Object.keys(validationErrors)
  toast.error('Veuillez corriger les erreurs dans le formulaire', {
    description: `Erreurs dans: ${errorFields.map(field => {
      const fieldLabels: Record<string, string> = {
        'specialization': 'Spécialisation',
        'title': 'Titre',
        'description': 'Description',
        'urgence': "Niveau d'urgence",
        'estimatedCost': 'Coût estimé',
        'estimatedDurationHours': 'Durée estimée'
      }
      return fieldLabels[field] || field
    }).join(', ')}`,
    duration: 6000
  })
})

const getUrgenceLabel = (urgence: string) => {
  switch (urgence) {
    case 'FAIBLE': return 'Faible'
    case 'MOYENNE': return 'Moyenne'
    case 'HAUTE': return 'Haute'
    case 'CRITIQUE': return 'Critique'
    default: return urgence
  }
}

const getUrgenceClass = (urgence: string) => {
  switch (urgence) {
    case 'FAIBLE': return 'text-green-600'
    case 'MOYENNE': return 'text-yellow-600'
    case 'HAUTE': return 'text-orange-600'
    case 'CRITIQUE': return 'text-red-600'
    default: return 'text-gray-600'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="p-4">
        <div class="flex items-center justify-between h-12">
          <!-- Left side - Back button and title -->
          <div class="flex items-center space-x-3">
            <Button variant="ghost" size="sm" @click="goBack" data-testid="back-button" class="hover:bg-gray-100">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Separator orientation="vertical" class="h-4" />
            <div class="flex items-center space-x-2">
              <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <Settings class="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h1 class="text-lg font-semibold text-gray-900">Créer une sous-mission</h1>
                <p class="text-sm text-gray-500" v-if="missionStore.currentMission">
                  Mission: {{ missionStore.currentMission.reference }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-4">

      <!-- Mission Context -->
      <Card v-if="missionStore.currentMission" class="shadow-sm border-0 bg-white mb-6">
        <CardHeader class="pb-4">
          <CardTitle class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
              <Briefcase class="w-4 h-4 text-blue-600" />
            </div>
            <span class="text-lg font-semibold">Mission principale</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Référence:</strong> {{ missionStore.currentMission.reference }}</p>
              <p><strong>Titre:</strong> {{ missionStore.currentMission.titre || missionStore.currentMission.description }}</p>
            </div>
            <div>
              <p><strong>Statut:</strong> {{ missionStore.currentMission.status }}</p>
              <p><strong>Urgence:</strong> {{ missionStore.currentMission.urgence }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Sub-Mission Creation Form -->
      <form @submit.prevent="onSubmit">
        <Card class="shadow-sm border-0 bg-white">
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg">
                <Settings class="w-4 h-4 text-green-600" />
              </div>
              <span class="text-lg font-semibold">Détails de la sous-mission</span>
            </CardTitle>
          <CardDescription>
            Créez une sous-mission spécialisée pour cette intervention
          </CardDescription>
          </CardHeader>
          <CardContent class="pt-0 space-y-6">
          <!-- Error Message -->
          <Alert v-if="submitError" variant="destructive">
            <AlertTriangle class="h-4 w-4" />
            <AlertDescription>{{ submitError }}</AlertDescription>
          </Alert>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField name="specialization" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>Spécialisation *</FormLabel>
                <Select v-bind="componentField" data-testid="specialization-select">
                  <FormControl>
                    <SelectTrigger :class="getFieldErrorClass('specialization')">
                      <SelectValue placeholder="Choisir une spécialisation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="spec in SPECIALIZATIONS" :key="spec" :value="spec">
                      {{ spec }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="urgence" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>Niveau d'urgence *</FormLabel>
                <Select v-bind="componentField" data-testid="urgence-select">
                  <FormControl>
                    <SelectTrigger :class="getFieldErrorClass('urgence')">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="urgence in Object.values(UrgenceLevel)" :key="urgence" :value="urgence">
                      <span :class="getUrgenceClass(urgence)">{{ getUrgenceLabel(urgence) }}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <!-- Title -->
          <FormField name="title" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Titre de la sous-mission *</FormLabel>
              <FormControl>
                <Input v-bind="componentField" placeholder="Ex: Réparation plomberie salle de bain" data-testid="title-input" :class="getFieldErrorClass('title')" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Description -->
          <FormField name="description" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Description détaillée *</FormLabel>
              <FormControl>
                <Textarea 
                  v-bind="componentField" 
                  placeholder="Décrivez précisément les travaux à effectuer, les étapes, les points d'attention..."
                  rows="4"
                  data-testid="description-textarea"
                  :class="getFieldErrorClass('description')"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Estimates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField name="estimatedCost" v-slot="{ componentField }">
              <FormItem>
                <FormLabel class="flex items-center space-x-2">
                  <Euro class="w-4 h-4" />
                  <span>Coût estimé (€)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    v-bind="componentField" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    data-testid="cost-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="estimatedDurationHours" v-slot="{ componentField }">
              <FormItem>
                <FormLabel class="flex items-center space-x-2">
                  <Clock class="w-4 h-4" />
                  <span>Durée estimée (heures)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    v-bind="componentField" 
                    type="number" 
                    min="0" 
                    step="0.5"
                    placeholder="0"
                    data-testid="duration-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <!-- Additional Requirements -->
          <div class="space-y-6">
            <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">Exigences et conditions</h4>
            
            <FormField name="materialsNeeded" v-slot="{ componentField }">
              <FormItem>
                <FormLabel class="flex items-center space-x-2">
                  <FileText class="w-4 h-4" />
                  <span>Matériaux et fournitures nécessaires</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    v-bind="componentField" 
                    placeholder="Listez les matériaux, outils ou équipements nécessaires..."
                    rows="3"
                    data-testid="materials-textarea"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="specialRequirements" v-slot="{ componentField }">
              <FormItem>
                <FormLabel class="flex items-center space-x-2">
                  <AlertTriangle class="w-4 h-4" />
                  <span>Exigences particulières</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    v-bind="componentField" 
                    placeholder="Compétences spéciales, certifications requises, normes à respecter..."
                    rows="3"
                    data-testid="requirements-textarea"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="accessRequirements" v-slot="{ componentField }">
              <FormItem>
                <FormLabel class="flex items-center space-x-2">
                  <Settings class="w-4 h-4" />
                  <span>Conditions d'accès</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    v-bind="componentField" 
                    placeholder="Instructions d'accès au chantier, horaires, contraintes spécifiques..."
                    rows="3"
                    data-testid="access-textarea"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

            <!-- Form Actions -->
            <div class="flex space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" @click="goBack" class="flex-1" :disabled="isLoading">
                Annuler
              </Button>
              <Button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white" :disabled="isLoading" data-testid="submit-button">
                <div v-if="isLoading" class="flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Création...</span>
                </div>
                <div v-else class="flex items-center space-x-2">
                  <Save class="w-4 h-4" />
                  <span>Créer la sous-mission</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <!-- Loading State -->
      <div v-if="missionStore.loadingStates.missionDetails" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Chargement des détails de la mission...</p>
        </div>
      </div>
    </div>
  </div>
</template>