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
import { Textarea } from '@/components/ui/textarea'
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
import { GET_SUB_MISSION_RATING_QUERY } from '@/graphql/queries/get-mission-rating'
import { useApolloClient } from '@vue/apollo-composable'
import { toast } from 'vue-sonner'
import type { SubMission, SubMissionDetails, MissionStatut } from '@/interfaces/sub-mission'
import type { Prestataire } from '@/interfaces/prestataire'
import type { FiltresDeRecherche } from '@/interfaces/filtres-de-recherche'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import placeholderImage from '@/assets/placeholder.svg'
import SubMissionDocuments from '@/components/SubMissionDocuments.vue'
import SubMissionComments from '@/components/SubMissionComments.vue'
import MissionHistory from '@/components/MissionHistory.vue'

const route = useRoute()
const router = useRouter()
const { client } = useApolloClient()
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

// Rating state
const showRatingDialog = ref(false)
const currentRating = ref<any>(null)
const loadingRating = ref(false)
const rating = ref(0)
const ratingComment = ref('')
const hasExistingRating = ref(false)
const ratingError = ref(false)
const statusError = ref(false)

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
    // Check for existing rating after loading details
    await checkExistingRating()
  } catch (error) {
    console.error('Error loading sub-mission details:', error)
  }
}

// Check if sub-mission already has a rating
const checkExistingRating = async () => {
  if (!missionStore.currentSubMission || missionStore.currentSubMission.statut !== 'TERMINEE') {
    return
  }
  
  loadingRating.value = true
  try {
    const result = await client.query({
      query: GET_SUB_MISSION_RATING_QUERY,
      variables: { subMissionId },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    })
    
    if (result.data?.subMissionRating) {
      currentRating.value = result.data.subMissionRating
      hasExistingRating.value = true
    } else {
      hasExistingRating.value = false
    }
  } catch (error) {
    console.error('Error checking rating:', error)
    hasExistingRating.value = false
  } finally {
    loadingRating.value = false
  }
}

// Event handlers for child components
const handleDocumentAdded = (document: any) => {
  // The sub-mission store will handle refreshing the sub-mission details
  loadSubMissionDetails()
}

const handleCommentAdded = (comment: any) => {
  // The sub-mission store will handle refreshing the sub-mission details
  loadSubMissionDetails()
}

const handleCommentsRefresh = () => {
  // Trigger refresh using mission store
  loadSubMissionDetails()
}

// Open rating dialog
const openRatingDialog = () => {
  rating.value = 0
  ratingComment.value = ''
  ratingError.value = false
  showRatingDialog.value = true
}

// Clear rating error when user selects a rating
const selectRating = (star: number) => {
  rating.value = star
  ratingError.value = false
}

// Clear status error when user selects a status  
const selectStatus = (status: MissionStatut) => {
  newStatus.value = status
  statusError.value = false
}

// Submit rating
const submitRating = async () => {
  if (!missionStore.currentSubMission) return
  
  // Validate rating is selected
  if (rating.value === 0) {
    ratingError.value = true
    toast.error('Veuillez sélectionner une note', {
      description: 'Une note entre 1 et 5 étoiles est requise pour évaluer le prestataire.',
      duration: 4000
    })
    return
  }
  
  ratingError.value = false
  
  try {
    await missionStore.rateSubMission(missionStore.currentSubMission.id, rating.value, ratingComment.value)
    
    toast.success('Évaluation envoyée avec succès', {
      description: `Note de ${rating.value}/5 attribuée au prestataire.`,
      duration: 3000
    })
    
    showRatingDialog.value = false
    rating.value = 0
    ratingComment.value = ''
    
    // Refresh rating status
    await checkExistingRating()
  } catch (error) {
    console.error('Error submitting rating:', error)
    toast.error('Erreur lors de l\'envoi de l\'évaluation', {
      description: 'Veuillez réessayer plus tard.',
      duration: 4000
    })
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

// Watch for status change to clear errors
watch(newStatus, () => {
  statusError.value = false
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
  
  // Validate status is selected
  if (!newStatus.value || newStatus.value.trim() === '') {
    statusError.value = true
    toast.error('Veuillez sélectionner un statut', {
      description: 'Un statut doit être sélectionné pour mettre à jour la sous-mission.',
      duration: 4000
    })
    return
  }
  
  statusError.value = false
  
  isUpdatingStatus.value = true
  try {
    await missionStore.updateSubMissionStatus({
      subMissionId: missionStore.currentSubMission.id,
      statut: newStatus.value,
      comment: `Status updated to ${newStatus.value}`
    })
    
    const statusLabels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'ASSIGNEE': 'Assignée',
      'EN_COURS': 'En cours', 
      'TERMINEE': 'Terminée',
      'SUSPENDUE': 'Suspendue',
      'ANNULEE': 'Annulée'
    }
    
    toast.success('Statut mis à jour avec succès', {
      description: `Statut changé vers: ${statusLabels[newStatus.value] || newStatus.value}`,
      duration: 3000
    })
    
    // Refresh sub-mission details
    await loadSubMissionDetails()
    showStatusDialog.value = false
  } catch (error) {
    console.error('Error updating sub-mission status:', error)
    toast.error('Erreur lors de la mise à jour du statut', {
      description: 'Veuillez réessayer plus tard.',
      duration: 4000
    })
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

const canRate = computed(() => {
  return isAssureur.value && 
         missionStore.currentSubMission?.statut === 'TERMINEE' &&
         !hasExistingRating.value
})

const canViewRating = computed(() => {
  return missionStore.currentSubMission?.statut === 'TERMINEE' &&
         hasExistingRating.value
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
              <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <Briefcase class="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 class="text-lg font-semibold text-gray-900">Détails de la sous-mission</h1>
                <p class="text-sm text-gray-500" v-if="missionStore.currentSubMission">
                  Référence: {{ missionStore.currentSubMission.reference }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Right side - Action buttons -->
          <div v-if="missionStore.currentSubMission" class="flex items-center space-x-2">
            <!-- Accept Button (Prestataires only) -->
            <Button 
              v-if="canAccept" 
              @click="acceptSubMission" 
              :disabled="isAccepting"
              data-testid="accept-button"
              class="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check class="w-4 h-4 mr-2" />
              {{ isAccepting ? 'Acceptation...' : 'Accepter' }}
            </Button>
            
            <!-- Update Status Button -->
            <Button 
              v-if="canUpdateStatus" 
              @click="showStatusDialog = true" 
              variant="outline"
              data-testid="status-button"
              class="border-gray-300 hover:bg-gray-50"
            >
              <Play class="w-4 h-4 mr-2" />
              Mettre à jour le statut
            </Button>
            
            <!-- Rating Button -->
            <Button 
              v-if="canRate" 
              @click="openRatingDialog" 
              data-testid="rating-button"
              class="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Star class="w-4 h-4 mr-2" />
              Noter le prestataire
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-4">
      <!-- Loading State -->
      <div v-if="missionStore.isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement des détails...</p>
        </div>
      </div>

      <!-- Sub-Mission Details -->
      <div v-else-if="missionStore.currentSubMission" class="space-y-8">
        <!-- Overview Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Info Card -->
          <div class="lg:col-span-2">
            <Card class="shadow-sm border-0 bg-white">
              <CardHeader class="pb-4">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3">
                    <div class="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl">
                      <Briefcase class="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle class="text-xl font-bold text-gray-900 mb-1">
                        {{ missionStore.currentSubMission.title }}
                      </CardTitle>
                      <p class="text-sm text-gray-500">{{ missionStore.currentSubMission.specialization }}</p>
                    </div>
                  </div>
                  <div class="flex flex-col space-y-2">
                    <Badge :class="getStatutBadge(missionStore.currentSubMission.statut).class" class="w-fit">
                      <component :is="getStatutBadge(missionStore.currentSubMission.statut).icon" class="w-3 h-3 mr-1" />
                      {{ getStatutBadge(missionStore.currentSubMission.statut).text }}
                    </Badge>
                    <Badge :class="getUrgenceBadge(missionStore.currentSubMission.urgence).class" class="w-fit">
                      {{ getUrgenceBadge(missionStore.currentSubMission.urgence).text }}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="pt-0">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div v-if="missionStore.currentSubMission.estimatedCost">
                      <div class="flex items-center space-x-2 text-green-600">
                        <div class="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg">
                          <Euro class="w-4 h-4" />
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Coût estimé</p>
                          <p class="font-semibold">{{ missionStore.currentSubMission.estimatedCost }}€</p>
                        </div>
                      </div>
                    </div>
                    <div v-if="missionStore.currentSubMission.estimatedDurationHours">
                      <div class="flex items-center space-x-2 text-blue-600">
                        <div class="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                          <Clock class="w-4 h-4" />
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Durée estimée</p>
                          <p class="font-semibold">{{ missionStore.currentSubMission.estimatedDurationHours }}h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <div class="flex items-center space-x-2 text-gray-600">
                        <div class="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg">
                          <Calendar class="w-4 h-4" />
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Date de création</p>
                          <p class="font-semibold">{{ new Date(missionStore.currentSubMission.createdAt).toLocaleDateString() }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Quick Actions Sidebar -->
          <div class="space-y-6">
            <!-- Quick Stats -->
            <Card class="shadow-sm border-0 bg-white">
              <CardHeader class="pb-3">
                <CardTitle class="text-lg font-semibold">Informations rapides</CardTitle>
              </CardHeader>
              <CardContent class="pt-0 space-y-3">
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm text-gray-600">Référence</span>
                  <span class="text-sm font-medium">{{ missionStore.currentSubMission.reference }}</span>
                </div>
                <Separator />
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm text-gray-600">Spécialisation</span>
                  <Badge variant="secondary" class="text-xs">{{ missionStore.currentSubMission.specialization }}</Badge>
                </div>
                <Separator />
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm text-gray-600">Urgence</span>
                  <Badge :class="getUrgenceBadge(missionStore.currentSubMission.urgence).class" class="text-xs">
                    {{ getUrgenceBadge(missionStore.currentSubMission.urgence).text }}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Description Section -->
        <Card class="shadow-sm border-0 bg-white">
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg">
                <FileText class="w-4 h-4 text-gray-600" />
              </div>
              <span class="text-lg font-semibold">Description de la mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <div class="prose prose-sm max-w-none">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ missionStore.currentSubMission.description }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Prestataire Section (if assigned) -->
        <Card v-if="missionStore.currentSubMission.prestataire" class="shadow-sm border-0 bg-white">
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg">
                <User class="w-4 h-4 text-green-600" />
              </div>
              <span class="text-lg font-semibold">Prestataire assigné</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <div class="space-y-6">
              <!-- Prestataire Header -->
              <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <Avatar class="w-14 h-14">
                  <AvatarImage :src="placeholderImage" />
                  <AvatarFallback class="text-lg bg-green-100 text-green-700 font-semibold">
                    {{ missionStore.currentSubMission.prestataire.contactPerson.split(' ').map(n => n[0]).join('') }}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="text-lg font-bold text-gray-900 mb-1">{{ missionStore.currentSubMission.prestataire.companyName }}</h3>
                      <p class="text-gray-600 mb-2">{{ missionStore.currentSubMission.prestataire.contactPerson }}</p>
                      <Badge class="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle class="w-3 h-3 mr-1" />
                        Assigné
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            
              <!-- Contact Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <h4 class="font-semibold text-gray-900 mb-3">Informations de contact</h4>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                        <Phone class="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
                        <p class="font-medium text-gray-900">{{ missionStore.currentSubMission.prestataire.phone }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-8 h-8 bg-purple-50 rounded-lg">
                        <Mail class="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                        <p class="font-medium text-gray-900">{{ missionStore.currentSubMission.prestataire.email }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Additional Info -->
                <div class="space-y-4">
                  <h4 class="font-semibold text-gray-900 mb-3">Informations complémentaires</h4>
                  <div class="space-y-3">
                    <!-- Rating if available -->
                    <div v-if="enhancedPrestataireInfo?.rating" class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-8 h-8 bg-amber-50 rounded-lg">
                        <Star class="w-4 h-4 text-amber-500 fill-current" />
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Note moyenne</p>
                        <p class="font-medium text-gray-900">{{ enhancedPrestataireInfo.rating }}/5</p>
                      </div>
                    </div>
                    <!-- Location if available -->
                    <div v-if="enhancedPrestataireInfo?.address?.city" class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-8 h-8 bg-red-50 rounded-lg">
                        <MapPin class="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Localisation</p>
                        <p class="font-medium text-gray-900">{{ enhancedPrestataireInfo.address.city }}</p>
                      </div>
                    </div>
                    <!-- Availability status -->
                    <div v-if="enhancedPrestataireInfo?.availabilityStatus" class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg">
                        <div :class="{
                          'w-3 h-3 rounded-full': true,
                          'bg-green-500': enhancedPrestataireInfo.availabilityStatus === 'AVAILABLE',
                          'bg-yellow-500': enhancedPrestataireInfo.availabilityStatus === 'BUSY',
                          'bg-red-500': enhancedPrestataireInfo.availabilityStatus === 'UNAVAILABLE',
                          'bg-gray-500': !enhancedPrestataireInfo.availabilityStatus
                        }"></div>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Disponibilité</p>
                        <p class="font-medium text-gray-900">{{ 
                          enhancedPrestataireInfo.availabilityStatus === 'AVAILABLE' ? 'Disponible' :
                          enhancedPrestataireInfo.availabilityStatus === 'BUSY' ? 'Occupé' :
                          enhancedPrestataireInfo.availabilityStatus === 'UNAVAILABLE' ? 'Indisponible' : 'Statut inconnu' 
                        }}</p>
                      </div>
                    </div>
                    <!-- Fallback info -->
                    <div v-if="!enhancedPrestataireInfo" class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg">
                        <Calendar class="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Statut</p>
                        <p class="font-medium text-gray-900">Assigné récemment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            
              <!-- Specialties if available -->
              <div v-if="enhancedPrestataireInfo?.specialties?.length" class="space-y-3">
                <h4 class="font-semibold text-gray-900">Spécialités</h4>
                <div class="flex flex-wrap gap-2">
                  <Badge 
                    v-for="specialty in enhancedPrestataireInfo.specialties.slice(0, 4)" 
                    :key="specialty" 
                    variant="secondary" 
                    class="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {{ specialty }}
                  </Badge>
                  <Badge 
                    v-if="enhancedPrestataireInfo.specialties.length > 4" 
                    variant="outline" 
                    class="border-gray-300 text-gray-600"
                  >
                    +{{ enhancedPrestataireInfo.specialties.length - 4 }} autres
                  </Badge>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  @click="handleContactClick({ ...missionStore.currentSubMission.prestataire, userId: missionStore.currentSubMission.prestataire.id } as Prestataire)"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageCircle class="w-4 h-4 mr-2" />
                  Contacter le prestataire
                </Button>
                <Button 
                  variant="outline"
                  @click="viewPrestataireDetails({ ...missionStore.currentSubMission.prestataire, userId: missionStore.currentSubMission.prestataire.id, address: { city: '', street: '', postalCode: '', country: '' }, specialties: [], rating: null, distance: null, availabilityStatus: '' } as Prestataire)"
                  class="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  <Eye class="w-4 h-4 mr-2" />
                  Voir le profil complet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Documents Section -->
        <SubMissionDocuments 
          :sub-mission-id="subMissionId"
          :can-upload="true"
          :can-delete="isAssureur"
          @document-added="handleDocumentAdded"
          data-testid="sub-mission-documents"
        />

        <!-- Comments Section -->
        <SubMissionComments 
          :sub-mission-id="subMissionId"
          :can-comment="true"
          @comment-added="handleCommentAdded"
          @refresh-requested="handleCommentsRefresh"
          data-testid="sub-mission-comments"
        />

        <!-- History Section -->
        <MissionHistory 
          :history="missionStore.subMissionHistory || []"
          data-testid="sub-mission-history"
        />

        <!-- Rating Display (if exists) -->
        <Card v-if="canViewRating && currentRating" class="shadow-sm border-0 bg-white">
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-amber-50 rounded-lg">
                <Star class="w-4 h-4 text-amber-500" />
              </div>
              <span class="text-lg font-semibold">Évaluation du prestataire</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <div class="space-y-6">
              <!-- Rating Stars -->
              <div class="flex items-center space-x-6">
                <div class="flex items-center space-x-1">
                  <Star 
                    v-for="star in 5" 
                    :key="star"
                    :class="[
                      'w-7 h-7',
                      star <= currentRating.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                    ]"
                  />
                </div>
                <div class="text-2xl font-bold text-gray-900">{{ currentRating.rating }}/5</div>
              </div>
              
              <!-- Comment -->
              <div v-if="currentRating.comment">
                <h4 class="font-semibold mb-3 text-gray-900">Commentaire</h4>
                <div class="bg-gray-50 p-4 rounded-xl">
                  <p class="text-gray-700 leading-relaxed">{{ currentRating.comment }}</p>
                </div>
              </div>
              
              <!-- Date -->
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar class="w-4 h-4" />
                <span>Évalué le {{ new Date(currentRating.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Additional Requirements -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card v-if="missionStore.currentSubMission.materialsNeeded" class="shadow-sm border-0 bg-white">
            <CardHeader class="pb-4">
              <CardTitle class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg">
                  <Settings class="w-4 h-4 text-orange-600" />
                </div>
                <span class="text-lg font-semibold">Matériaux nécessaires</span>
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="bg-orange-50 p-4 rounded-xl">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ missionStore.currentSubMission.materialsNeeded }}</p>
              </div>
            </CardContent>
          </Card>

          <Card v-if="missionStore.currentSubMission.specialRequirements" class="shadow-sm border-0 bg-white">
            <CardHeader class="pb-4">
              <CardTitle class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-8 h-8 bg-red-50 rounded-lg">
                  <AlertTriangle class="w-4 h-4 text-red-600" />
                </div>
                <span class="text-lg font-semibold">Exigences spéciales</span>
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="bg-red-50 p-4 rounded-xl">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ missionStore.currentSubMission.specialRequirements }}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Access Requirements -->
        <Card v-if="missionStore.currentSubMission.accessRequirements" class="shadow-sm border-0 bg-white">
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-purple-50 rounded-lg">
                <MapPin class="w-4 h-4 text-purple-600" />
              </div>
              <span class="text-lg font-semibold">Conditions d'accès</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <div class="bg-purple-50 p-4 rounded-xl">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ missionStore.currentSubMission.accessRequirements }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Parent Mission Link -->
        <Card class="shadow-sm border-0 bg-white">
          <CardHeader class="pb-4">
            <CardTitle class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-indigo-50 rounded-lg">
                <Briefcase class="w-4 h-4 text-indigo-600" />
              </div>
              <span class="text-lg font-semibold">Mission principale</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <Button 
              variant="outline" 
              @click="router.push(`/mission/${missionStore.currentSubMission.missionId}`)"
              class="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Briefcase class="w-4 h-4 mr-2" />
              Consulter la mission principale
            </Button>
          </CardContent>
        </Card>

        <!-- Prestataire Assignment Section -->
        <div v-if="canAssign" class="space-y-6">
          <!-- Search Filters -->
          <Card class="shadow-sm border-0 bg-white">
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
      <div v-else class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-50 rounded-xl">
            <AlertTriangle class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Sous-mission introuvable</h3>
          <p class="text-gray-500 mb-6">Cette sous-mission n'existe pas ou vous n'avez pas l'autorisation de la consulter.</p>
          <Button variant="outline" @click="goBack" class="border-gray-300 hover:bg-gray-50">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    </div>
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
            <Label for="status" :class="statusError ? 'text-red-600' : ''">Nouveau statut *</Label>
            <Select v-model="newStatus">
              <SelectTrigger :class="statusError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''">
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
            <p v-if="statusError" class="text-sm text-red-600 mt-1">Veuillez sélectionner un statut</p>
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

    <!-- Rating Dialog -->
    <Dialog :open="showRatingDialog" @update:open="(open) => { if (!open) showRatingDialog = false }">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Noter le prestataire</DialogTitle>
          <DialogDescription v-if="missionStore.currentSubMission">
            Évaluer le travail effectué pour: {{ missionStore.currentSubMission.title }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div>
            <Label :class="ratingError ? 'text-red-600' : ''">Note (1-5 étoiles) *</Label>
            <div class="flex items-center space-x-2 mt-2" :class="ratingError ? 'border-2 border-red-500 rounded-md p-2 bg-red-50' : 'p-2'">
              <button
                v-for="star in 5"
                :key="star"
                @click="selectRating(star)"
                class="focus:outline-none"
                :data-testid="`rating-star-${star}`"
              >
                <Star 
                  :class="[
                    'w-8 h-8 transition-colors',
                    star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  ]"
                />
              </button>
              <span class="ml-2 text-sm text-gray-600">{{ rating }}/5</span>
            </div>
            <p v-if="ratingError" class="text-sm text-red-600 mt-1">Une note est requise pour évaluer le prestataire</p>
          </div>

          <div>
            <Label for="rating-comment">Commentaire (optionnel)</Label>
            <Textarea
              id="rating-comment"
              v-model="ratingComment"
              placeholder="Votre évaluation du travail..."
              data-testid="rating-comment"
            />
          </div>

          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="showRatingDialog = false" data-testid="cancel-rating">
              Annuler
            </Button>
            <Button 
              @click="submitRating" 
              :disabled="rating === 0"
              data-testid="submit-rating"
            >
              Noter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
</template>