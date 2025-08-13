<template>
  <div class="profile-management">
    <h2 class="text-2xl font-bold mb-6">Gestion du Profil</h2>
    
    <div v-if="loading" class="loading-spinner">
      Chargement du profil...
    </div>
    
    <div v-else-if="error" class="error-message text-red-600">
      Erreur lors du chargement du profil: {{ error }}
    </div>
    
    <div v-else class="profile-content">
      <!-- Availability Status Section -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Statut de Disponibilité</CardTitle>
          <CardDescription>Gérez votre disponibilité pour recevoir de nouvelles missions</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-4">
            <Label for="availability-status">Statut actuel:</Label>
            <Select v-model="availabilityStatus" @update:model-value="updateAvailabilityStatus">
              <SelectTrigger class="w-48" data-testid="availability-status-select">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Disponible
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Occupé
                  </div>
                </SelectItem>
                <SelectItem value="unavailable">
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Indisponible
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div class="flex items-center" data-testid="availability-indicator">
              <div :class="availabilityIndicatorClass" class="w-3 h-3 rounded-full mr-2"></div>
              <span class="text-sm text-gray-600">{{ availabilityStatusText }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Profile Information Form -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Informations du Profil</CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles et professionnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="updateProfile" class="space-y-6">
            <!-- Company Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  v-model="profileForm.companyInfo.telephone"
                  data-testid="profile-telephone-input"
                  placeholder="Numéro de téléphone"
                />
              </div>
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="profileForm.companyInfo.email"
                  data-testid="profile-email-input"
                  type="email"
                  placeholder="Adresse email"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="adresse">Adresse</Label>
              <Input
                id="adresse"
                v-model="profileForm.companyInfo.adresse"
                data-testid="profile-adresse-input"
                placeholder="Adresse complète"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="codePostal">Code Postal</Label>
                <Input
                  id="codePostal"
                  v-model="profileForm.companyInfo.codePostal"
                  data-testid="profile-code-postal-input"
                  placeholder="Code postal"
                />
              </div>
              <div class="space-y-2">
                <Label for="ville">Ville</Label>
                <Input
                  id="ville"
                  v-model="profileForm.companyInfo.ville"
                  data-testid="profile-ville-input"
                  placeholder="Ville"
                />
              </div>
            </div>

            <!-- Service Parameters -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="serviceRadius">Rayon de Service (km)</Label>
                <Input
                  id="serviceRadius"
                  v-model.number="profileForm.serviceRadius"
                  data-testid="profile-service-radius-input"
                  type="number"
                  min="1"
                  max="200"
                  placeholder="Rayon en kilomètres"
                />
              </div>
              <div class="space-y-2">
                <Label for="hourlyRate">Tarif Horaire (€)</Label>
                <Input
                  id="hourlyRate"
                  v-model.number="profileForm.hourlyRate"
                  data-testid="profile-hourly-rate-input"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Tarif par heure"
                />
              </div>
            </div>

            <!-- Profile Description -->
            <div class="space-y-2">
              <Label for="description">Description du Profil</Label>
              <Textarea
                id="description"
                v-model="profileForm.description"
                data-testid="profile-description-textarea"
                placeholder="Décrivez vos services et spécialités..."
                rows="4"
              />
            </div>

            <!-- Sectors and Specialties -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Secteurs d'Activité</Label>
                <div class="space-y-2">
                  <div v-for="sector in availableSectors" :key="sector" class="flex items-center space-x-2">
                    <input
                      :id="`sector-${sector}`"
                      type="checkbox"
                      :value="sector"
                      v-model="profileForm.sectors"
                      :data-testid="`sector-${sector.toLowerCase().replace(/\s+/g, '-')}-checkbox`"
                      class="rounded border-gray-300"
                    />
                    <Label :for="`sector-${sector}`" class="text-sm">{{ sector }}</Label>
                  </div>
                </div>
              </div>
              
              <div class="space-y-2">
                <Label>Spécialités</Label>
                <div class="space-y-2">
                  <div v-for="specialty in availableSpecialties" :key="specialty" class="flex items-center space-x-2">
                    <input
                      :id="`specialty-${specialty}`"
                      type="checkbox"
                      :value="specialty"
                      v-model="profileForm.specialties"
                      :data-testid="`specialty-${specialty.toLowerCase().replace(/\s+/g, '-')}-checkbox`"
                      class="rounded border-gray-300"
                    />
                    <Label :for="`specialty-${specialty}`" class="text-sm">{{ specialty }}</Label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex space-x-4">
              <Button
                type="submit"
                :disabled="updating"
                data-testid="save-profile-button"
                class="bg-black text-white hover:bg-gray-800"
              >
                <div v-if="updating" class="mr-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                {{ updating ? 'Sauvegarde...' : 'Sauvegarder' }}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                @click="resetForm"
                data-testid="reset-profile-button"
              >
                Réinitialiser
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Success/Error Messages -->
      <div v-if="updateSuccess" class="success-message bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p class="text-green-800">Profil mis à jour avec succès!</p>
      </div>
      
      <div v-if="updateError" class="error-message bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800">{{ updateError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  UPDATE_PRESTATAIRE_PROFILE_MUTATION, 
  UPDATE_PRESTATAIRE_AVAILABILITY_MUTATION,
  type PrestataireProfileUpdateInput,
  type AvailabilityStatus
} from '@/graphql/mutations/update-prestataire-profile'

// Mock data for sectors and specialties
const availableSectors = ref([
  'Bâtiment',
  'Plomberie',
  'Électricité',
  'Chauffage',
  'Climatisation',
  'Toiture',
  'Carrelage',
  'Peinture'
])

const availableSpecialties = ref([
  'Dégâts des eaux',
  'Incendie',
  'Expertise technique',
  'Rénovation',
  'Urgences',
  'Diagnostic',
  'Travaux neufs',
  'Maintenance'
])

// Reactive form data
const profileForm = reactive<PrestataireProfileUpdateInput>({
  companyInfo: {
    telephone: '',
    email: '',
    adresse: '',
    codePostal: '',
    ville: ''
  },
  sectors: [],
  specialties: [],
  description: '',
  serviceRadius: 50,
  hourlyRate: 50
})

const availabilityStatus = ref<AvailabilityStatus>('available')
const loading = ref(false)
const error = ref('')
const updating = ref(false)
const updateSuccess = ref(false)
const updateError = ref('')

// GraphQL mutations
const { mutate: updateProfile } = useMutation(UPDATE_PRESTATAIRE_PROFILE_MUTATION)
const { mutate: updateAvailability } = useMutation(UPDATE_PRESTATAIRE_AVAILABILITY_MUTATION)

// Computed properties for availability status
const availabilityStatusText = computed(() => {
  switch (availabilityStatus.value) {
    case 'available': return 'Disponible pour de nouvelles missions'
    case 'busy': return 'Occupé sur des missions en cours'
    case 'unavailable': return 'Indisponible temporairement'
    default: return ''
  }
})

const availabilityIndicatorClass = computed(() => {
  switch (availabilityStatus.value) {
    case 'available': return 'bg-green-500'
    case 'busy': return 'bg-yellow-500'
    case 'unavailable': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
})

// Methods
const updateAvailabilityStatus = async (status: AvailabilityStatus) => {
  try {
    await updateAvailability({ status })
    updateSuccess.value = true
    setTimeout(() => (updateSuccess.value = false), 3000)
  } catch (err) {
    updateError.value = 'Erreur lors de la mise à jour du statut de disponibilité'
    setTimeout(() => (updateError.value = ''), 3000)
  }
}

const handleUpdateProfile = async () => {
  updating.value = true
  updateError.value = ''
  
  try {
    await updateProfile({ input: profileForm })
    updateSuccess.value = true
    setTimeout(() => (updateSuccess.value = false), 3000)
  } catch (err: any) {
    updateError.value = err.message || 'Erreur lors de la mise à jour du profil'
  } finally {
    updating.value = false
  }
}

const resetForm = () => {
  Object.assign(profileForm, {
    companyInfo: {
      telephone: '',
      email: '',
      adresse: '',
      codePostal: '',
      ville: ''
    },
    sectors: [],
    specialties: [],
    description: '',
    serviceRadius: 50,
    hourlyRate: 50
  })
}

onMounted(() => {
  // In a real app, you would fetch the current profile data here
  loading.value = false
})
</script>

<style scoped>
.profile-management {
  @apply p-6;
}

.loading-spinner {
  @apply flex justify-center items-center py-12 text-gray-500;
}

.error-message {
  @apply bg-red-50 border border-red-200 rounded-lg p-4;
}

.success-message {
  @apply bg-green-50 border border-green-200 rounded-lg p-4;
}
</style>