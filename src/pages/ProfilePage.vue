<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Save, 
  ArrowLeft, 
  Edit,
  Shield,
  Star
} from 'lucide-vue-next'
import type {
  PrestataireProfileUpdateInput,
  AssureurProfileUpdateInput
} from '@/graphql/queries/profile'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const isEditing = ref(false)

// Form data
const formData = ref<PrestataireProfileUpdateInput & AssureurProfileUpdateInput>({})

const userInitials = computed(() => {
  const profile = profileStore.currentProfile
  if (!profile) return 'U'
  return profile.companyName?.charAt(0).toUpperCase() || 'U'
})

onMounted(async () => {
  await profileStore.fetchProfile()
  initializeFormData()
})

function initializeFormData() {
  const profile = profileStore.currentProfile
  if (profile) {
    formData.value = {
      companyName: profile.companyName || '',
      siret: profile.siret || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      postalCode: profile.postalCode || '',
      website: profile.website || '',
      description: profile.description || '',
      licenseNumber: '',
      contactNom: '',
      contactPrenom: '',
      ...(profileStore.prestataireProfile && {
        specialties: profileStore.prestataireProfile.specialties || [],
        secteursActivite: profileStore.prestataireProfile.secteursActivite || '',
        zonesGeographiques: profileStore.prestataireProfile.zonesGeographiques || {
          departements: [],
          regions: [],
          codesPostaux: []
        }
      }),
      ...(profileStore.assureurProfile && {
        numeroAgrement: profileStore.assureurProfile.numeroAgrement || '',
        typesAssurance: profileStore.assureurProfile.typesAssurance || [],
        zonesCouverture: profileStore.assureurProfile.zonesCouverture || {
          departements: [],
          regions: [],
          codesPostaux: []
        },
        garantiesProposees: profileStore.assureurProfile.garantiesProposees || ''
      })
    }
  }
}

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  initializeFormData()
}

async function saveProfile() {
  if (!formData.value) return
  
  const success = await profileStore.updateProfile(formData.value)
  if (success) {
    isEditing.value = false
  }
}

function goBack() {
  if (profileStore.isPrestataire) {
    router.push('/prestataire-dashboard')
  } else {
    router.push('/assureur-dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Button variant="ghost" size="sm" @click="goBack" class="hover:bg-gray-100">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Mon Profil</h1>
              <p class="text-gray-600">Gérez les informations de votre entreprise</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <Avatar class="h-12 w-12">
              <AvatarFallback class="bg-gray-100 text-gray-700 text-lg">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="profileStore.loading" class="p-4">
      <Card class="bg-white">
        <CardContent class="p-8">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p class="mt-2 text-gray-600">Chargement du profil...</p>
          </div>
        </CardContent>
      </Card>
    </div>


    <!-- Profile content -->
    <div v-if="!profileStore.loading" class="p-4">
      <div class="space-y-6">
        <!-- Company Information -->
        <Card class="bg-white">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="flex items-center">
                  <Building class="w-5 h-5 mr-2" />
                  Informations de l'entreprise
                </CardTitle>
                <CardDescription>
                  Informations générales sur votre entreprise
                </CardDescription>
              </div>
              <Button 
                v-if="!isEditing" 
                variant="outline" 
                size="sm" 
                @click="startEditing"
                class="hover:bg-gray-50"
              >
                <Edit class="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="companyName">Nom de l'entreprise / Raison sociale</Label>
                <Input 
                  id="companyName"
                  v-model="formData.companyName" 
                  :disabled="!isEditing"
                  class="mt-1"
                />
              </div>
              <div>
                <Label for="siret">SIRET</Label>
                <Input 
                  id="siret"
                  v-model="formData.siret" 
                  :disabled="!isEditing"
                  class="mt-1"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="email">Email</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    id="email"
                    v-model="formData.email" 
                    :disabled="!isEditing"
                    class="pl-10 mt-1"
                  />
                </div>
              </div>
              <div>
                <Label for="phone">Téléphone</Label>
                <div class="relative">
                  <Phone class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    id="phone"
                    v-model="formData.phone" 
                    :disabled="!isEditing"
                    class="pl-10 mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label for="address">Adresse</Label>
              <div class="relative">
                <MapPin class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input 
                  id="address"
                  v-model="formData.address" 
                  :disabled="!isEditing"
                  class="pl-10 mt-1"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="city">Ville</Label>
                <Input 
                  id="city"
                  v-model="formData.city" 
                  :disabled="!isEditing"
                  class="mt-1"
                />
              </div>
              <div>
                <Label for="postalCode">Code postal</Label>
                <Input 
                  id="postalCode"
                  v-model="formData.postalCode" 
                  :disabled="!isEditing"
                  class="mt-1"
                />
              </div>
            </div>

            <div>
              <Label for="website">Site web</Label>
              <div class="relative">
                <Globe class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input 
                  id="website"
                  v-model="formData.website" 
                  :disabled="!isEditing"
                  class="pl-10 mt-1"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label for="description">Description</Label>
              <Textarea 
                id="description"
                v-model="formData.description" 
                :disabled="!isEditing"
                class="mt-1"
                rows="3"
                placeholder="Décrivez votre entreprise..."
              />
            </div>

            <div v-if="profileStore.isPrestataire || profileStore.isAssureur">
              <Label for="licenseNumber">Numéro de licence (optionnel)</Label>
              <Input 
                id="licenseNumber"
                v-model="formData.licenseNumber" 
                :disabled="!isEditing"
                class="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Contact Information -->
        <Card class="bg-white">
          <CardHeader>
            <CardTitle class="flex items-center">
              <User class="w-5 h-5 mr-2" />
              Contact principal
            </CardTitle>
            <CardDescription>
              Informations de la personne de contact
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="contactNom">Nom</Label>
                <Input 
                  id="contactNom"
                  v-model="formData.contactNom" 
                  :disabled="!isEditing"
                  class="mt-1"
                />
              </div>
              <div>
                <Label for="contactPrenom">Prénom</Label>
                <Input 
                  id="contactPrenom"
                  v-model="formData.contactPrenom" 
                  :disabled="!isEditing"
                  class="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Prestataire specific fields -->
        <Card v-if="profileStore.isPrestataire && profileStore.prestataireProfile" class="bg-white">
          <CardHeader>
            <CardTitle class="flex items-center">
              <Star class="w-5 h-5 mr-2" />
              Informations spécialisées
            </CardTitle>
            <CardDescription>
              Spécificités de votre activité de prestataire
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label for="secteursActivite">Secteurs d'activité</Label>
              <Input 
                id="secteursActivite"
                v-model="formData.secteursActivite" 
                :disabled="!isEditing"
                class="mt-1"
              />
            </div>

            <div>
              <Label>Spécialités</Label>
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge v-for="specialty in profileStore.prestataireProfile.specialties" :key="specialty" variant="secondary">
                  {{ specialty }}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Statut de disponibilité</Label>
              <div class="mt-2">
                <Badge 
                  :variant="profileStore.prestataireProfile.availabilityStatus === 'available' ? 'default' : 'secondary'"
                  class="capitalize"
                >
                  {{ profileStore.prestataireProfile.availabilityStatus }}
                </Badge>
              </div>
            </div>

            <div v-if="profileStore.prestataireProfile.rating">
              <Label>Note moyenne</Label>
              <div class="mt-2 flex items-center">
                <Star class="w-5 h-5 text-yellow-400 fill-current" />
                <span class="ml-1 font-medium">{{ profileStore.prestataireProfile.rating.toFixed(1) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Assureur specific fields -->
        <Card v-if="profileStore.isAssureur && profileStore.assureurProfile" class="bg-white">
          <CardHeader>
            <CardTitle class="flex items-center">
              <Shield class="w-5 h-5 mr-2" />
              Informations d'assurance
            </CardTitle>
            <CardDescription>
              Spécificités de votre activité d'assureur
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label for="numeroAgrement">Numéro d'agrément</Label>
              <Input 
                id="numeroAgrement"
                v-model="formData.numeroAgrement" 
                :disabled="!isEditing"
                class="mt-1"
              />
            </div>

            <div>
              <Label>Types d'assurance</Label>
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge v-for="type in profileStore.assureurProfile.typesAssurance" :key="type" variant="secondary">
                  {{ type }}
                </Badge>
              </div>
            </div>

            <div>
              <Label for="garantiesProposees">Garanties proposées</Label>
              <Textarea 
                id="garantiesProposees"
                v-model="formData.garantiesProposees" 
                :disabled="!isEditing"
                class="mt-1"
                rows="3"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Action buttons -->
        <Card v-if="isEditing" class="bg-white">
          <CardContent class="p-6">
            <div class="flex items-center justify-end space-x-3">
              <Button variant="outline" @click="cancelEditing" :disabled="profileStore.loading">
                Annuler
              </Button>
              <Button @click="saveProfile" :disabled="profileStore.loading" class="bg-black hover:bg-gray-800">
                <Save class="w-4 h-4 mr-2" />
                {{ profileStore.loading ? 'Enregistrement...' : 'Enregistrer' }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>