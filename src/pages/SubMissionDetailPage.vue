<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Euro,
  MapPin,
  User,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  Search,
  UserPlus,
  Check,
  X,
  Play,
  Pause,
  StopCircle,
  Users,
  Filter,
  Star,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  Building,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { useMissionStore } from '@/stores/mission'
import { useAuthStore } from '@/stores/auth'
import { useAssureurStore } from '@/stores/assureur'
import type { SubMission, SubMissionDetails, MissionStatut } from '@/interfaces/sub-mission'
import type { Prestataire } from '@/interfaces/prestataire'
import type { FiltresDeRecherche } from '@/interfaces/filtres-de-recherche'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import placeholderImage from '@/assets/placeholder.svg'

const route = useRoute()
const router = useRouter()
const missionStore = useMissionStore()
const authStore = useAuthStore()
const assureurStore = useAssureurStore()

const subMissionId = route.params.id as string
const isAssureur = computed(() => authStore.user?.accountType === 'ASSUREUR')
const isPrestataire = computed(() => authStore.user?.accountType === 'PRESTATAIRE')

// New reactive state
const showStatusDialog = ref(false)
const showPrestataireDetails = ref(false)
const searchTerm = ref('')
const selectedSecteur = ref('all')
const selectedRegion = ref('all')
const selectedDepartement = ref('all')
const selectedPrestataire = ref<Prestataire | null>(null)
const viewPrestataire = ref<Prestataire | null>(null)
const isAssigning = ref(false)
const isAccepting = ref(false)
const isUpdatingStatus = ref(false)
const newStatus = ref<MissionStatut>('EN_COURS' as MissionStatut)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Filter options from dashboard
const secteurs = ["Maçonnerie", "Plomberie", "Électricité", "Chauffage", "Couverture", "Menuiserie", "Peinture"]
const regions = [
  "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire", "Corse",
  "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie", "Nouvelle-Aquitaine",
  "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"
]
const departements = ["01 - Ain", "13 - Bouches-du-Rhône", "31 - Haute-Garonne", "69 - Rhône", "75 - Paris"]

// Use assureur store prestataires with pagination
const prestataires = computed(() => assureurStore.prestataires)
const totalPages = computed(() => Math.ceil(prestataires.value.length / itemsPerPage.value))
const paginatedPrestataires = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return prestataires.value.slice(start, end)
})

// Load sub-mission details
const loadSubMissionDetails = async () => {
  try {
    await missionStore.fetchSubMissionDetails(subMissionId)
  } catch (error) {
    console.error('Error loading sub-mission details:', error)
  }
}

loadSubMissionDetails()

// Load prestataires on mount
onMounted(() => {
  applyFilters()
  // Load enhanced prestataire info if sub-mission is already assigned
  if (missionStore.currentSubMission?.prestataireId) {
    getEnhancedPrestataireInfo(missionStore.currentSubMission.prestataireId)
  }
})

// Helper functions for prestataire actions
const handleContactClick = (prestataire: Prestataire) => {
  router.push({
    path: '/chat',
    query: {
      prestataireId: prestataire.userId,
      contactName: prestataire.nom || prestataire.raisonSociale || prestataire.contactPerson,
      contactPerson: prestataire.nom || prestataire.contactPerson,
      type: 'prestataire'
    }
  })
}

// Enhanced prestataire details with fetch from store if available
const enhancedPrestataireInfo = ref<Prestataire | null>(null)

const getEnhancedPrestataireInfo = async (prestataireId: string) => {
  // Try to find enhanced prestataire info from assureur store
  const enhancedInfo = assureurStore.prestataires.find(p => p.id === prestataireId)
  if (enhancedInfo) {
    enhancedPrestataireInfo.value = enhancedInfo
  }
  return enhancedInfo
}

const viewPrestataireDetails = (prestataire: Prestataire) => {
  viewPrestataire.value = prestataire
  showPrestataireDetails.value = true
}

// Watch for changes in filters to reset pagination
watch([searchTerm, selectedSecteur, selectedRegion, selectedDepartement], () => {
  currentPage.value = 1
})

const goBack = () => {
  router.back()
}

// Apply filters like dashboard
const applyFilters = () => {
  let locationFilter = undefined
  if (selectedDepartement.value !== 'all') {
    locationFilter = selectedDepartement.value
  } else if (selectedRegion.value !== 'all') {
    locationFilter = selectedRegion.value
  }

  const filters: FiltresDeRecherche = {
    name: searchTerm.value === '' ? undefined : searchTerm.value,
    specialty: selectedSecteur.value === 'all' ? undefined : selectedSecteur.value,
    location: locationFilter
  }
  
  assureurStore.searchPrestataires(filters)
}

const resetFilters = () => {
  searchTerm.value = ''
  selectedSecteur.value = 'all'
  selectedRegion.value = 'all'
  selectedDepartement.value = 'all'
  currentPage.value = 1
  applyFilters()
}

// Pagination functions
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}


// Assign sub-mission to prestataire
const assignToPrestataire = async (prestataire: Prestataire) => {
  if (!missionStore.currentSubMission) return
  
  isAssigning.value = true
  try {
    await missionStore.assignSubMission({
      subMissionId: missionStore.currentSubMission.id,
      prestataireId: prestataire.id
    })
    
    // Refresh sub-mission details
    await loadSubMissionDetails()
    selectedPrestataire.value = null
  } catch (error) {
    console.error('Error assigning sub-mission:', error)
  } finally {
    isAssigning.value = false
  }
}

// Accept sub-mission (for prestataires)
const acceptSubMission = async () => {
  if (!missionStore.currentSubMission) return
  
  isAccepting.value = true
  try {
    await missionStore.acceptSubMission(missionStore.currentSubMission.id)
    // Refresh sub-mission details
    await loadSubMissionDetails()
  } catch (error) {
    console.error('Error accepting sub-mission:', error)
  } finally {
    isAccepting.value = false
  }
}

// Update sub-mission status
const updateSubMissionStatus = async () => {
  if (!missionStore.currentSubMission) return
  
  isUpdatingStatus.value = true
  try {
    await missionStore.updateSubMissionStatus({
      subMissionId: missionStore.currentSubMission.id,
      status: newStatus.value,
      comment: `Status updated to ${newStatus.value}`
    })
    
    // Refresh sub-mission details
    await loadSubMissionDetails()
    showStatusDialog.value = false
  } catch (error) {
    console.error('Error updating sub-mission status:', error)
  } finally {
    isUpdatingStatus.value = false
  }
}

// Helper functions
const canAssign = computed(() => {
  return isAssureur.value && 
         missionStore.currentSubMission?.statut === 'EN_ATTENTE'
})

const canAccept = computed(() => {
  return isPrestataire.value && 
         missionStore.currentSubMission?.statut === 'EN_ATTENTE' &&
         !missionStore.currentSubMission?.prestataireId
})

const canUpdateStatus = computed(() => {
  return (isAssureur.value || isPrestataire.value) && 
         missionStore.currentSubMission?.prestataireId
})

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case "EN_ATTENTE":
      return { variant: "outline", icon: Clock, text: "En attente", class: "text-yellow-600 border-yellow-600" }
    case "ASSIGNEE":
      return { variant: "default", icon: CheckCircle, text: "Assignée", class: "text-blue-600 border-blue-600" }
    case "EN_COURS":
      return { variant: "default", icon: Clock, text: "En cours", class: "text-blue-600 border-blue-600" }
    case "TERMINEE":
      return { variant: "default", icon: CheckCircle, text: "Terminée", class: "text-green-600 border-green-600" }
    case "ANNULEE":
      return { variant: "destructive", icon: XCircle, text: "Annulée", class: "text-red-600 border-red-600" }
    case "SUSPENDUE":
      return { variant: "secondary", icon: AlertTriangle, text: "Suspendue", class: "text-orange-600 border-orange-600" }
    default:
      return { variant: "outline", icon: Clock, text: statut, class: "" }
  }
}

const getUrgenceBadge = (urgence: string) => {
  switch (urgence) {
    case "FAIBLE":
      return { text: "Faible", class: "bg-green-100 text-green-800" }
    case "MOYENNE":
      return { text: "Moyenne", class: "bg-yellow-100 text-yellow-800" }
    case "HAUTE":
      return { text: "Haute", class: "bg-orange-100 text-orange-800" }
    case "CRITIQUE":
      return { text: "Critique", class: "bg-red-100 text-red-800" }
    default:
      return { text: urgence, class: "bg-gray-100 text-gray-800" }
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Button variant="outline" size="sm" @click="goBack" data-testid="back-button">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 class="text-2xl font-bold">Détails de la sous-mission</h1>
          <p class="text-gray-600" v-if="missionStore.currentSubMission">
            Référence: {{ missionStore.currentSubMission.reference }}
          </p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div v-if="missionStore.currentSubMission" class="flex flex-wrap gap-3">
        
        <!-- Accept Button (Prestataires only) -->
        <Button 
          v-if="canAccept" 
          @click="acceptSubMission" 
          :disabled="isAccepting"
          data-testid="accept-button"
        >
          <Check class="w-4 h-4 mr-2" />
          {{ isAccepting ? 'Acceptation...' : 'Accepter cette sous-mission' }}
        </Button>
        
        <!-- Update Status Button -->
        <Button 
          v-if="canUpdateStatus" 
          @click="showStatusDialog = true" 
          variant="outline"
          data-testid="status-button"
        >
          <Play class="w-4 h-4 mr-2" />
          Mettre à jour le statut
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="missionStore.isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des détails...</p>
      </div>
    </div>

    <!-- Sub-Mission Details -->
    <div v-else-if="missionStore.currentSubMission" class="space-y-6">
      <!-- Status and Info Card -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center space-x-2">
              <Briefcase class="w-5 h-5" />
              <span>{{ missionStore.currentSubMission.title }}</span>
            </CardTitle>
            <div class="flex space-x-2">
              <Badge :class="getStatutBadge(missionStore.currentSubMission.statut).class">
                <component :is="getStatutBadge(missionStore.currentSubMission.statut).icon" class="w-3 h-3 mr-1" />
                {{ getStatutBadge(missionStore.currentSubMission.statut).text }}
              </Badge>
              <Badge :class="getUrgenceBadge(missionStore.currentSubMission.urgence).class">
                {{ getUrgenceBadge(missionStore.currentSubMission.urgence).text }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-2">Spécialisation</h4>
              <p class="text-gray-700">{{ missionStore.currentSubMission.specialization }}</p>
            </div>
            <div v-if="missionStore.currentSubMission.estimatedCost">
              <h4 class="font-semibold mb-2">Coût estimé</h4>
              <div class="flex items-center text-green-600 font-semibold">
                <Euro class="w-4 h-4 mr-1" />
                {{ missionStore.currentSubMission.estimatedCost }}€
              </div>
            </div>
            <div v-if="missionStore.currentSubMission.estimatedDurationHours">
              <h4 class="font-semibold mb-2">Durée estimée</h4>
              <div class="flex items-center text-gray-700">
                <Clock class="w-4 h-4 mr-1" />
                {{ missionStore.currentSubMission.estimatedDurationHours }}h
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-2">Date de création</h4>
              <div class="flex items-center text-gray-700">
                <Calendar class="w-4 h-4 mr-1" />
                {{ new Date(missionStore.currentSubMission.createdAt).toLocaleDateString() }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Description -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <FileText class="w-5 h-5" />
            <span>Description</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-gray-700 whitespace-pre-wrap">{{ missionStore.currentSubMission.description }}</p>
        </CardContent>
      </Card>

      <!-- Prestataire Info (if assigned) -->
      <Card v-if="missionStore.currentSubMission.prestataire">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <User class="w-5 h-5" />
            <span>Prestataire assigné</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Prestataire Header -->
            <div class="flex items-center space-x-4">
              <Avatar class="w-16 h-16">
                <AvatarImage :src="placeholderImage" />
                <AvatarFallback class="text-lg">
                  {{ missionStore.currentSubMission.prestataire.contactPerson.split(' ').map(n => n[0]).join('') }}
                </AvatarFallback>
              </Avatar>
              <div class="flex-1">
                <h3 class="text-xl font-bold">{{ missionStore.currentSubMission.prestataire.companyName }}</h3>
                <p class="text-gray-600 text-lg">{{ missionStore.currentSubMission.prestataire.contactPerson }}</p>
                <Badge class="mt-1 bg-green-100 text-green-800">
                  <CheckCircle class="w-3 h-3 mr-1" />
                  Assigné
                </Badge>
              </div>
            </div>
            
            <!-- Contact Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold mb-3 text-gray-900">Contact</h4>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2 text-gray-700">
                    <Phone class="w-4 h-4 text-gray-500" />
                    <span>{{ missionStore.currentSubMission.prestataire.phone }}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-gray-700">
                    <Mail class="w-4 h-4 text-gray-500" />
                    <span>{{ missionStore.currentSubMission.prestataire.email }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Additional Info -->
              <div>
                <h4 class="font-semibold mb-3 text-gray-900">Informations</h4>
                <div class="space-y-2">
                  <!-- Rating if available -->
                  <div v-if="enhancedPrestataireInfo?.rating" class="flex items-center space-x-2 text-gray-700">
                    <Star class="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{{ enhancedPrestataireInfo.rating }}/5</span>
                    <span class="text-xs text-gray-500">(Note)</span>
                  </div>
                  <!-- Location if available -->
                  <div v-if="enhancedPrestataireInfo?.address?.city" class="flex items-center space-x-2 text-gray-700">
                    <MapPin class="w-4 h-4 text-gray-500" />
                    <span>{{ enhancedPrestataireInfo.address.city }}</span>
                  </div>
                  <!-- Availability status -->
                  <div v-if="enhancedPrestataireInfo?.availabilityStatus" class="flex items-center space-x-2 text-gray-700">
                    <div :class="{
                      'w-3 h-3 rounded-full': true,
                      'bg-green-500': enhancedPrestataireInfo.availabilityStatus === 'AVAILABLE',
                      'bg-yellow-500': enhancedPrestataireInfo.availabilityStatus === 'BUSY',
                      'bg-red-500': enhancedPrestataireInfo.availabilityStatus === 'UNAVAILABLE',
                      'bg-gray-500': !enhancedPrestataireInfo.availabilityStatus
                    }"></div>
                    <span>{{ 
                      enhancedPrestataireInfo.availabilityStatus === 'AVAILABLE' ? 'Disponible' :
                      enhancedPrestataireInfo.availabilityStatus === 'BUSY' ? 'Occupé' :
                      enhancedPrestataireInfo.availabilityStatus === 'UNAVAILABLE' ? 'Indisponible' : 'Statut inconnu' 
                    }}</span>
                  </div>
                  <!-- Fallback info -->
                  <div v-if="!enhancedPrestataireInfo" class="flex items-center space-x-2 text-gray-700">
                    <Calendar class="w-4 h-4 text-gray-500" />
                    <span>Assigné récemment</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Specialties if available -->
            <div v-if="enhancedPrestataireInfo?.specialties?.length" class="space-y-2">
              <h4 class="font-semibold text-gray-900">Spécialités</h4>
              <div class="flex flex-wrap gap-1">
                <Badge 
                  v-for="specialty in enhancedPrestataireInfo.specialties.slice(0, 4)" 
                  :key="specialty" 
                  variant="secondary" 
                  class="text-xs"
                >
                  {{ specialty }}
                </Badge>
                <Badge 
                  v-if="enhancedPrestataireInfo.specialties.length > 4" 
                  variant="outline" 
                  class="text-xs"
                >
                  +{{ enhancedPrestataireInfo.specialties.length - 4 }}
                </Badge>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                @click="handleContactClick({ ...missionStore.currentSubMission.prestataire, userId: missionStore.currentSubMission.prestataire.id } as Prestataire)"
                class="flex-1"
              >
                <MessageCircle class="w-4 h-4 mr-2" />
                Contacter le prestataire
              </Button>
              <Button 
                variant="outline"
                @click="viewPrestataireDetails({ ...missionStore.currentSubMission.prestataire, userId: missionStore.currentSubMission.prestataire.id, address: { city: '', street: '', postalCode: '', country: '' }, specialties: [], rating: null, distance: null, availabilityStatus: '' } as Prestataire)"
                class="flex-1"
              >
                <Eye class="w-4 h-4 mr-2" />
                Voir détails complets
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Additional Requirements -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card v-if="missionStore.currentSubMission.materialsNeeded">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Settings class="w-5 h-5" />
              <span>Matériaux nécessaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-gray-700 whitespace-pre-wrap">{{ missionStore.currentSubMission.materialsNeeded }}</p>
          </CardContent>
        </Card>

        <Card v-if="missionStore.currentSubMission.specialRequirements">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <AlertTriangle class="w-5 h-5" />
              <span>Exigences spéciales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-gray-700 whitespace-pre-wrap">{{ missionStore.currentSubMission.specialRequirements }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Access Requirements -->
      <Card v-if="missionStore.currentSubMission.accessRequirements">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <MapPin class="w-5 h-5" />
            <span>Conditions d'accès</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-gray-700 whitespace-pre-wrap">{{ missionStore.currentSubMission.accessRequirements }}</p>
        </CardContent>
      </Card>

      <!-- Parent Mission Link -->
      <Card>
        <CardHeader>
          <CardTitle>Mission principale</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            @click="router.push(`/mission/${missionStore.currentSubMission.missionId}`)"
            class="w-full"
          >
            <Briefcase class="w-4 h-4 mr-2" />
            Voir la mission principale
          </Button>
        </CardContent>
      </Card>

      <!-- Prestataire Assignment Section -->
      <div v-if="canAssign" class="space-y-6">
        <!-- Search Filters -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center text-lg">
              <Filter class="w-5 h-5 mr-2" />
              Recherche de prestataires
            </CardTitle>
            <CardDescription>
              Trouvez un prestataire spécialisé en {{ missionStore.currentSubMission?.specialization }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label for="search">Recherche</Label>
                <div class="relative">
                  <Search class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nom, entreprise, spécialité..."
                    v-model="searchTerm"
                    class="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Secteur</Label>
                <Select v-model="selectedSecteur">
                  <SelectTrigger>
                    <SelectValue placeholder="Tous secteurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous secteurs</SelectItem>
                    <SelectItem v-for="secteur in secteurs" :key="secteur" :value="secteur">
                      {{ secteur }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Région</Label>
                <Select v-model="selectedRegion">
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes régions</SelectItem>
                    <SelectItem v-for="region in regions" :key="region" :value="region">
                      {{ region }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Département</Label>
                <Select v-model="selectedDepartement">
                  <SelectTrigger>
                    <SelectValue placeholder="Tous départements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous départements</SelectItem>
                    <SelectItem v-for="dept in departements" :key="dept" :value="dept">
                      {{ dept }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="flex items-end space-x-2">
                <Button class="flex-1 bg-black border-black text-white" @click="applyFilters">
                  Rechercher
                </Button>
                <Button variant="outline" @click="resetFilters">
                  <RefreshCw class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <!-- Results Table -->
        <Card>
          <CardHeader>
            <div class="flex justify-between items-center">
              <CardTitle>{{ prestataires.length }} prestataire(s) trouvé(s)</CardTitle>
              <div class="text-sm text-gray-600">
                Page {{ currentPage }} sur {{ totalPages }} ({{ itemsPerPage }} par page)
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="prestataires.length === 0" class="text-center py-8 text-gray-500">
              <Users class="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun prestataire trouvé</p>
              <p class="text-sm">Modifiez les filtres pour élargir votre recherche</p>
            </div>
            
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestataire</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Spécialités</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="prestataire in paginatedPrestataires" :key="prestataire.id" class="hover:bg-gray-50">
                    <TableCell>
                      <div class="flex items-center space-x-3">
                        <Avatar class="w-10 h-10">
                          <AvatarImage :src="prestataire.avatar || placeholderImage" />
                          <AvatarFallback>
                            {{ prestataire.contactPerson.split(' ').map(n => n[0]).join('') }}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p class="font-semibold">{{ prestataire.companyName }}</p>
                          <p class="text-sm text-gray-600">{{ prestataire.contactPerson }}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center space-x-1">
                        <MapPin class="w-4 h-4 text-gray-500" />
                        <span class="text-sm">{{ prestataire.address.city }}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-wrap gap-1">
                        <Badge v-for="specialty in prestataire.specialties.slice(0, 2)" :key="specialty" variant="secondary" class="text-xs">
                          {{ specialty }}
                        </Badge>
                        <Badge v-if="prestataire.specialties.length > 2" variant="outline" class="text-xs">
                          +{{ prestataire.specialties.length - 2 }}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center space-x-1" v-if="prestataire.rating">
                        <Star class="w-4 h-4 text-yellow-500 fill-current" />
                        <span class="text-sm font-medium">{{ prestataire.rating }}</span>
                      </div>
                      <span v-else class="text-sm text-gray-400">-</span>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center space-x-1">
                        <div :class="{
                          'w-2 h-2 rounded-full': true,
                          'bg-green-500': prestataire.availabilityStatus === 'AVAILABLE',
                          'bg-yellow-500': prestataire.availabilityStatus === 'BUSY',
                          'bg-red-500': prestataire.availabilityStatus === 'UNAVAILABLE',
                          'bg-gray-500': !prestataire.availabilityStatus
                        }"></div>
                        <span class="text-xs">
                          {{ prestataire.availabilityStatus === 'AVAILABLE' ? 'Disponible' :
                            prestataire.availabilityStatus === 'BUSY' ? 'Occupé' :
                            prestataire.availabilityStatus === 'UNAVAILABLE' ? 'Indisponible' : 'Inconnu' }}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal class="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click="viewPrestataireDetails(prestataire)">
                            <Eye class="w-4 h-4 mr-2" />
                            Voir fiche
                          </DropdownMenuItem>
                          <DropdownMenuItem @click="handleContactClick(prestataire)">
                            <MessageCircle class="w-4 h-4 mr-2" />
                            Contacter
                          </DropdownMenuItem>
                          <DropdownMenuItem @click="assignToPrestataire(prestataire)" :disabled="isAssigning">
                            <UserPlus class="w-4 h-4 mr-2" />
                            {{ isAssigning ? 'Attribution...' : 'Assigner' }}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <!-- Pagination -->
              <div class="flex items-center justify-between pt-4" v-if="totalPages > 1">
                <div class="text-sm text-gray-600">
                  Affichage {{ (currentPage - 1) * itemsPerPage + 1 }} - 
                  {{ Math.min(currentPage * itemsPerPage, prestataires.length) }} 
                  sur {{ prestataires.length }} prestataires
                </div>
                <div class="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    @click="previousPage" 
                    :disabled="currentPage === 1"
                  >
                    <ChevronLeft class="w-4 h-4" />
                    Précédent
                  </Button>
                  
                  <div class="flex items-center space-x-1">
                    <Button 
                      v-for="page in Math.min(totalPages, 5)" 
                      :key="page"
                      variant="outline" 
                      size="sm"
                      :class="{ 'bg-black text-white': currentPage === page }"
                      @click="goToPage(page)"
                    >
                      {{ page }}
                    </Button>
                    <span v-if="totalPages > 5" class="text-sm text-gray-500">...</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    @click="nextPage" 
                    :disabled="currentPage === totalPages"
                  >
                    Suivant
                    <ChevronRight class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <AlertTriangle class="w-12 h-12 mx-auto mb-4 text-red-500" />
      <p class="text-gray-500">Sous-mission introuvable</p>
      <Button variant="outline" @click="goBack" class="mt-4">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Retour
      </Button>
    </div>


    <!-- Update Status Dialog -->
    <Dialog :open="showStatusDialog" @update:open="showStatusDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="flex items-center space-x-2">
            <Play class="w-5 h-5" />
            <span>Mettre à jour le statut</span>
          </DialogTitle>
          <DialogDescription>
            Changez le statut de cette sous-mission
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <div>
            <Label for="status">Nouveau statut</Label>
            <Select v-model="newStatus">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="ASSIGNEE">Assignée</SelectItem>
                <SelectItem value="EN_COURS">En cours</SelectItem>
                <SelectItem value="TERMINEE">Terminée</SelectItem>
                <SelectItem value="SUSPENDUE">Suspendue</SelectItem>
                <SelectItem value="ANNULEE">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end space-x-2 pt-4">
            <Button variant="outline" @click="showStatusDialog = false">
              Annuler
            </Button>
            <Button @click="updateSubMissionStatus" :disabled="isUpdatingStatus">
              {{ isUpdatingStatus ? 'Mise à jour...' : 'Mettre à jour' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Prestataire Details Dialog -->
    <Dialog :open="showPrestataireDetails" @update:open="showPrestataireDetails = $event">
      <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto bg-white" v-if="viewPrestataire">
        <DialogHeader>
          <DialogTitle class="flex items-center space-x-3">
            <Avatar class="w-12 h-12">
              <AvatarImage :src="viewPrestataire.avatar || placeholderImage" />
              <AvatarFallback>
                {{ viewPrestataire.contactPerson.split(' ').map(n => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 class="text-xl font-bold">{{ viewPrestataire.companyName }}</h3>
              <p class="text-gray-600">{{ viewPrestataire.contactPerson }}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-6">
          <!-- Informations générales -->
          <div>
            <h4 class="font-semibold mb-3">Informations générales</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Localisation:</span>
                <p>{{ viewPrestataire.address.city }}</p>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="font-semibold mb-3">Contact</h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-center space-x-2">
                <Phone class="w-4 h-4 text-gray-500" />
                <span>{{ viewPrestataire.phone }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Mail class="w-4 h-4 text-gray-500" />
                <span>{{ viewPrestataire.email }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Building class="w-4 h-4 text-gray-500" />
                <span>{{ viewPrestataire.address.street }}, {{ viewPrestataire.address.postalCode }} {{ viewPrestataire.address.city }}</span>
              </div>
            </div>
          </div>

          <!-- Spécialités -->
          <div>
            <h4 class="font-semibold mb-3">Spécialités</h4>
            <div class="space-y-2">
              <div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge v-for="specialite in viewPrestataire.specialties" :key="specialite" variant="secondary">
                    {{ specialite }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Évaluations -->
          <div>
            <h4 class="font-semibold mb-3">Évaluations</h4>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2" v-if="viewPrestataire.rating">
                <Star class="w-5 h-5 text-yellow-500 fill-current" />
                <span class="text-lg font-semibold">{{ viewPrestataire.rating }}</span>
                <span class="text-gray-500">/ 5</span>
              </div>
              <span v-else class="text-gray-500">Aucune évaluation</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2 pt-4 border-t">
            <Button size="sm" class="flex-1 bg-black border-black text-white" @click="handleContactClick(viewPrestataire)">
              <MessageCircle class="w-4 h-4 mr-1" />
              Contacter
            </Button>
            <Button size="sm" class="bg-black border-black text-white" @click="assignToPrestataire(viewPrestataire)" :disabled="isAssigning">
              <UserPlus class="w-4 h-4 mr-1" />
              {{ isAssigning ? 'Attribution...' : 'Assigner' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>