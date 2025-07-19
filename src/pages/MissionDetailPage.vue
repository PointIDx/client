<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  Download,
  Euro,
  Clock,
  Building,
  AlertTriangle,
  MessageCircle,
  History,
  Upload,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-vue-next'
import { useQuery } from '@vue/apollo-composable'
import { GET_MISSION_DETAILS_QUERY } from '@/graphql/queries/get-mission-details'
import type { MissionDetails } from '@/interfaces/MissionDetails'
import { getMissionStatusBadge } from '@/utils/status-badges'
import { useAuthStore } from '@/stores/auth'
import { usePrestataireStore } from '@/stores/prestataire'
import { useAssureurStore } from '@/stores/assureur'
import RatingDialog from '@/components/RatingDialog.vue'
import MissionDocuments from '@/components/MissionDocuments.vue'
import MissionComments from '@/components/MissionComments.vue'
import MissionHistory from '@/components/MissionHistory.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const prestataireStore = usePrestataireStore()
const assureurStore = useAssureurStore()

const missionId = route.params.id as string
const mission = ref<MissionDetails | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showRatingDialog = ref(false)
const ratingLoading = ref(false)

// Get mission details
const { onResult, onError } = useQuery(GET_MISSION_DETAILS_QUERY, { missionId })

onResult((queryResult) => {
  if (queryResult.data?.getMissionDetails) {
    mission.value = queryResult.data.getMissionDetails
    console.log('📋 Mission details loaded:', mission.value)
  }
  loading.value = false
})

onError((err) => {
  console.error('❌ Error loading mission details:', err)
  error.value = 'Erreur lors du chargement des détails de la mission'
  loading.value = false
})

// Computed properties
const statusBadge = computed(() => {
  if (!mission.value) return null
  return getMissionStatusBadge(mission.value.status)
})

const urgenceBadge = computed(() => {
  if (!mission.value) return null
  const urgence = mission.value.urgence
  const urgenceMap: Record<string, { text: string; class: string }> = {
    'FAIBLE': { text: 'Faible', class: 'bg-green-100 text-green-800' },
    'MOYENNE': { text: 'Moyenne', class: 'bg-yellow-100 text-yellow-800' },
    'HAUTE': { text: 'Haute', class: 'bg-orange-100 text-orange-800' },
    'CRITIQUE': { text: 'Critique', class: 'bg-red-100 text-red-800' }
  }
  return urgenceMap[urgence] || { text: urgence, class: 'bg-gray-100 text-gray-800' }
})

const isAssureur = computed(() => authStore.user?.accountType === 'ASSUREUR')
const isPrestataire = computed(() => authStore.user?.accountType === 'PRESTATAIRE')

const goBack = () => {
  if (isAssureur.value) {
    router.push('/assureur-dashboard')
  } else if (isPrestataire.value) {
    router.push('/prestataire-dashboard')
  } else {
    router.back()
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


// Mission lifecycle actions
const handleAcceptMission = async (estimatedCompletionDate?: string, comment?: string) => {
  if (!mission.value) return
  try {
    await prestataireStore.acceptMissionEnhanced(mission.value.id, estimatedCompletionDate, comment)
    // Refetch mission details to get updated status
    window.location.reload()
  } catch (error) {
    console.error('Error accepting mission:', error)
  }
}

const handleRefuseMission = async (reason: string) => {
  if (!mission.value) return
  try {
    await prestataireStore.refuseMission(mission.value.id, reason)
    window.location.reload()
  } catch (error) {
    console.error('Error refusing mission:', error)
  }
}

const handleStartMission = async (startComment?: string) => {
  if (!mission.value) return
  try {
    await prestataireStore.startMission(mission.value.id, startComment)
    window.location.reload()
  } catch (error) {
    console.error('Error starting mission:', error)
  }
}

const handleCompleteMission = async (completionComment: string, actualCost?: number, completionPhotos?: string[]) => {
  if (!mission.value) return
  try {
    await prestataireStore.completeMission(mission.value.id, completionComment, actualCost, completionPhotos)
    window.location.reload()
  } catch (error) {
    console.error('Error completing mission:', error)
  }
}

const handleSuspendMission = async (suspensionReason: string, expectedResumeDate?: string) => {
  if (!mission.value) return
  try {
    await assureurStore.suspendMission(mission.value.id, suspensionReason, expectedResumeDate)
    window.location.reload()
  } catch (error) {
    console.error('Error suspending mission:', error)
  }
}

const handleResumeMission = async (resumeComment?: string) => {
  if (!mission.value) return
  try {
    await assureurStore.resumeMission(mission.value.id, resumeComment)
    window.location.reload()
  } catch (error) {
    console.error('Error resuming mission:', error)
  }
}

const handleValidateMission = async (validationComment?: string) => {
  if (!mission.value) return
  try {
    await assureurStore.validateMissionCompletion(mission.value.id, validationComment)
    window.location.reload()
  } catch (error) {
    console.error('Error validating mission:', error)
  }
}

const handleCancelMission = async (cancellationReason: string) => {
  if (!mission.value) return
  try {
    if (isPrestataire.value) {
      await prestataireStore.cancelMission(mission.value.id, cancellationReason)
    } else if (isAssureur.value) {
      await assureurStore.cancelMission(mission.value.id, cancellationReason)
    }
    window.location.reload()
  } catch (error) {
    console.error('Error canceling mission:', error)
  }
}

const handleRatePrestataire = async (ratingData: { rating: number; comment: string }) => {
  if (!mission.value) return
  
  ratingLoading.value = true
  try {
    await assureurStore.ratePrestataire(
      mission.value.id, 
      ratingData.rating, 
      ratingData.comment || undefined
    )
    showRatingDialog.value = false
  } catch (error) {
    console.error('Error rating prestataire:', error)
  } finally {
    ratingLoading.value = false
  }
}

const openRatingDialog = () => {
  showRatingDialog.value = true
}

const handleCommentAdded = (newComment: any) => {
  // Add the new comment to the mission data
  if (mission.value) {
    mission.value.commentaires.push(newComment)
  }
}

const refreshMissionData = async () => {
  // Refresh the mission data by re-running the query
  window.location.reload()
}

// Check what actions are available based on mission status and user role
const availableActions = computed(() => {
  if (!mission.value || !authStore.user) return []
  
  const actions = []
  const status = mission.value.status
  
  if (isPrestataire.value) {
    if (status === 'EN_ATTENTE') {
      actions.push('accept', 'refuse')
    } else if (status === 'ASSIGNEE') {
      actions.push('start', 'cancel')
    } else if (status === 'EN_COURS') {
      actions.push('complete', 'cancel')
    }
  } else if (isAssureur.value) {
    if (status !== 'TERMINEE') {
      actions.push('suspend', 'cancel')
    }
    if (status === 'SUSPENDUE') {
      actions.push('resume')
    }
    if (status === 'TERMINEE') {
      actions.push('validate', 'rate')
    }
  }
  
  return actions
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <Button variant="ghost" @click="goBack" class="flex items-center space-x-2">
              <ArrowLeft class="w-4 h-4" />
              <span>Retour</span>
            </Button>
            <div class="h-6 w-px bg-gray-300"></div>
            <div v-if="mission">
              <h1 class="text-xl font-semibold">Mission {{ mission.reference }}</h1>
              <p class="text-sm text-gray-600">Détails complets de la mission</p>
            </div>
          </div>
          <div v-if="mission" class="flex items-center space-x-2">
            <Badge v-if="statusBadge" :class="statusBadge.class">
              <component :is="statusBadge.icon" class="w-3 h-3 mr-1" />
              {{ statusBadge.text }}
            </Badge>
            <Badge v-if="urgenceBadge" :class="urgenceBadge.class">
              {{ urgenceBadge.text }}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Chargement des détails...</p>
        </div>
      </div>

      <!-- Error State -->
      <Alert v-else-if="error" class="mb-6">
        <AlertTriangle class="h-4 w-4" />
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- Mission Details -->
      <div v-else-if="mission" class="space-y-6">
        <!-- Mission Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Info -->
          <div class="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <FileText class="w-5 h-5" />
                  <span>Informations de la mission</span>
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <h3 class="font-medium text-gray-900">Description</h3>
                  <p class="mt-1 text-gray-700">{{ mission.description }}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Lieu d'intervention</h4>
                    <div class="flex items-start space-x-2">
                      <MapPin class="w-4 h-4 text-gray-500 mt-0.5" />
                      <div class="text-sm text-gray-700">
                        <p>{{ mission.location.street }}</p>
                        <p>{{ mission.location.postalCode }} {{ mission.location.city }}</p>
                        <p>{{ mission.location.country }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                      <Calendar class="w-4 h-4 text-gray-500" />
                      <div class="text-sm">
                        <span class="text-gray-500">Créée le:</span>
                        <span class="ml-1 text-gray-900">{{ formatDate(mission.dateDeCreation) }}</span>
                      </div>
                    </div>
                    
                    <div v-if="mission.deadline" class="flex items-center space-x-2">
                      <Clock class="w-4 h-4 text-gray-500" />
                      <div class="text-sm">
                        <span class="text-gray-500">Échéance:</span>
                        <span class="ml-1 text-gray-900">{{ formatDate(mission.deadline) }}</span>
                      </div>
                    </div>
                    
                    <div v-if="mission.estimatedCost" class="flex items-center space-x-2">
                      <Euro class="w-4 h-4 text-gray-500" />
                      <div class="text-sm">
                        <span class="text-gray-500">Budget estimé:</span>
                        <span class="ml-1 text-gray-900 font-medium">{{ mission.estimatedCost }}€</span>
                      </div>
                    </div>
                    
                    <div v-if="mission.actualCost" class="flex items-center space-x-2">
                      <Euro class="w-4 h-4 text-gray-500" />
                      <div class="text-sm">
                        <span class="text-gray-500">Coût réel:</span>
                        <span class="ml-1 text-gray-900 font-medium">{{ mission.actualCost }}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Client Info -->
            <Card v-if="mission.societaire">
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <User class="w-5 h-5" />
                  <span>Client</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div>
                    <p class="font-medium">{{ mission.societaire.firstName }} {{ mission.societaire.lastName }}</p>
                    <p class="text-sm text-gray-600">Dossier: {{ mission.societaire.dossierNumber }}</p>
                  </div>
                  
                  <div class="space-y-2">
                    <div v-if="mission.societaire.phone" class="flex items-center space-x-2">
                      <Phone class="w-4 h-4 text-gray-500" />
                      <span class="text-sm">{{ mission.societaire.phone }}</span>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <Mail class="w-4 h-4 text-gray-500" />
                      <span class="text-sm">{{ mission.societaire.email }}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Prestataire Info -->
            <Card v-if="mission.prestataire">
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <Building class="w-5 h-5" />
                  <span>Prestataire</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div>
                    <p class="font-medium">{{ mission.prestataire.companyName }}</p>
                    <p class="text-sm text-gray-600">Contact: {{ mission.prestataire.contactPerson }}</p>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <Phone class="w-4 h-4 text-gray-500" />
                      <span class="text-sm">{{ mission.prestataire.phone }}</span>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <Mail class="w-4 h-4 text-gray-500" />
                      <span class="text-sm">{{ mission.prestataire.email }}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card v-else>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <Building class="w-5 h-5" />
                  <span>Prestataire</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-gray-600">Aucun prestataire assigné</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Mission Actions -->
        <Card v-if="availableActions.length > 0" class="mb-6">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <component :is="isPrestataire ? 'User' : 'Building'" class="w-5 h-5" />
              <span>Actions disponibles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-3">
              <!-- Prestataire Actions -->
              <Button v-if="availableActions.includes('accept')" 
                      @click="handleAcceptMission()" 
                      class="bg-green-600 hover:bg-green-700">
                <CheckCircle class="w-4 h-4 mr-2" />
                Accepter la mission
              </Button>
              
              <Button v-if="availableActions.includes('refuse')" 
                      @click="handleRefuseMission('Mission refusée par le prestataire')" 
                      variant="destructive">
                <XCircle class="w-4 h-4 mr-2" />
                Refuser la mission
              </Button>
              
              <Button v-if="availableActions.includes('start')" 
                      @click="handleStartMission()" 
                      class="bg-blue-600 hover:bg-blue-700">
                <Clock class="w-4 h-4 mr-2" />
                Démarrer la mission
              </Button>
              
              <Button v-if="availableActions.includes('complete')" 
                      @click="handleCompleteMission('Mission terminée avec succès')" 
                      class="bg-green-600 hover:bg-green-700">
                <CheckCircle class="w-4 h-4 mr-2" />
                Terminer la mission
              </Button>

              <!-- Assureur Actions -->
              <Button v-if="availableActions.includes('suspend')" 
                      @click="handleSuspendMission('Mission suspendue par l\'assureur')" 
                      class="bg-orange-600 hover:bg-orange-700">
                <AlertTriangle class="w-4 h-4 mr-2" />
                Suspendre
              </Button>
              
              <Button v-if="availableActions.includes('resume')" 
                      @click="handleResumeMission()" 
                      class="bg-blue-600 hover:bg-blue-700">
                <Clock class="w-4 h-4 mr-2" />
                Reprendre
              </Button>
              
              <Button v-if="availableActions.includes('validate')" 
                      @click="handleValidateMission()" 
                      class="bg-green-600 hover:bg-green-700">
                <CheckCircle class="w-4 h-4 mr-2" />
                Valider la mission
              </Button>
              
              <Button v-if="availableActions.includes('rate')" 
                      @click="openRatingDialog()" 
                      class="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Star class="w-4 h-4 mr-2" />
                Évaluer le prestataire
              </Button>

              <!-- Common Actions -->
              <Button v-if="availableActions.includes('cancel')" 
                      @click="handleCancelMission('Mission annulée')" 
                      variant="destructive">
                <XCircle class="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Tabs for detailed information -->
        <Tabs default-value="documents" class="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">Documents ({{ mission.documents.length }})</TabsTrigger>
            <TabsTrigger value="comments">Messages ({{ mission.commentaires.length }})</TabsTrigger>
            <TabsTrigger value="history">Historique ({{ mission.historique.length }})</TabsTrigger>
          </TabsList>

          <!-- Documents Tab -->
          <TabsContent value="documents">
            <MissionDocuments 
              :mission-id="missionId"
              :can-upload="true"
              :can-delete="isAssureur"
            />
          </TabsContent>

          <!-- Comments Tab -->
          <TabsContent value="comments">
            <MissionComments 
              :mission-id="missionId"
              :comments="mission.commentaires"
              :can-comment="true"
              @comment-added="handleCommentAdded"
              @refresh-requested="refreshMissionData"
            />
          </TabsContent>

          <!-- History Tab -->
          <TabsContent value="history">
            <MissionHistory :history="mission.historique" />
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <!-- Rating Dialog -->
    <RatingDialog
      :open="showRatingDialog"
      @update:open="showRatingDialog = $event"
      @submit="handleRatePrestataire"
      :loading="ratingLoading"
      :prestataire-info="mission?.prestataire ? {
        companyName: mission.prestataire.companyName,
        contactPerson: mission.prestataire.contactPerson
      } : undefined"
    />
  </div>
</template>