<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  AlertTriangle, 
  Briefcase, 
  Plus, 
  Eye, 
  Euro, 
  Clock, 
  Calendar,
  MoreHorizontal,
  User,
  FileText
} from 'lucide-vue-next'
import { useQuery } from '@vue/apollo-composable'
import { GET_MISSION_DETAILS_QUERY } from '@/graphql/queries/get-mission-details'
import type { MissionDetails } from '@/interfaces/MissionDetails'
import { useAuthStore } from '@/stores/auth'
import { usePrestataireStore } from '@/stores/prestataire'
import { useAssureurStore } from '@/stores/assureur'
import { useMissionStore } from '@/stores/mission'

// Mission Components
import MissionHeader from '@/components/mission/MissionHeader.vue'
import MissionClientInfo from '@/components/mission/MissionClientInfo.vue'
import MissionWorksiteInfo from '@/components/mission/MissionWorksiteInfo.vue'
import MissionIncidentInfo from '@/components/mission/MissionIncidentInfo.vue'
import MissionSummary from '@/components/mission/MissionSummary.vue'
import MissionDetailedInfo from '@/components/mission/MissionDetailedInfo.vue'
import MissionParticipants from '@/components/mission/MissionParticipants.vue'
import MissionActionButtons from '@/components/mission/MissionActionButtons.vue'
import MissionQuickActions from '@/components/mission/MissionQuickActions.vue'
import MissionRatingDialog from '@/components/mission/MissionRatingDialog.vue'

// Existing Components
import MissionDocuments from '@/components/MissionDocuments.vue'
import MissionComments from '@/components/MissionComments.vue'
import MissionHistory from '@/components/MissionHistory.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const prestataireStore = usePrestataireStore()
const assureurStore = useAssureurStore()
const missionStore = useMissionStore()

const missionId = route.params.id as string
const showRatingDialog = ref(false)
const rating = ref(0)
const hoverRating = ref(0)
const ratingComment = ref('')
const ratingLoading = ref(false)

// Computed properties
const isAssureur = computed(() => authStore.user?.accountType === 'ASSUREUR')
const isPrestataire = computed(() => authStore.user?.accountType === 'PRESTATAIRE')
const isSocietaire = computed(() => authStore.user?.accountType === 'SOCIETAIRE')

// Load mission details using the mission store
const loadMissionDetails = async () => {
  try {
    await missionStore.fetchMissionDetails(missionId)
    // Also load sub-missions if user is assureur
    if (isAssureur.value) {
      await missionStore.fetchSubMissions(missionId)
    }
  } catch (err) {
    console.error('❌ Error loading mission details:', err)
  }
}

// Initialize on mount
loadMissionDetails()

const goBack = () => {
  if (isAssureur.value) {
    router.push('/assureur-dashboard')
  } else if (isPrestataire.value) {
    router.push('/prestataire-dashboard')
  } else {
    router.back()
  }
}

// Sub-mission helper methods
const viewSubMissionDetails = (subMissionId: string) => {
  router.push(`/sub-mission/${subMissionId}`)
}

const openCreateSubMissionDialog = () => {
  router.push(`/mission/${missionId}/create-sub-mission`)
}

const getSubMissionStatusClass = (statut: string) => {
  switch (statut) {
    case "EN_ATTENTE":
      return "bg-yellow-100 text-yellow-800"
    case "ASSIGNEE":
      return "bg-blue-100 text-blue-800"
    case "EN_COURS":
      return "bg-blue-100 text-blue-800"
    case "TERMINEE":
      return "bg-green-100 text-green-800"
    case "ANNULEE":
      return "bg-red-100 text-red-800"
    case "SUSPENDUE":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getSubMissionStatusText = (statut: string) => {
  switch (statut) {
    case "EN_ATTENTE":
      return "En attente"
    case "ASSIGNEE":
      return "Assignée"
    case "EN_COURS":
      return "En cours"
    case "TERMINEE":
      return "Terminée"
    case "ANNULEE":
      return "Annulée"
    case "SUSPENDUE":
      return "Suspendue"
    default:
      return statut
  }
}

const getUrgenceClass = (urgence: string) => {
  switch (urgence) {
    case "FAIBLE":
      return "bg-green-100 text-green-800"
    case "MOYENNE":
      return "bg-yellow-100 text-yellow-800"
    case "HAUTE":
      return "bg-orange-100 text-orange-800"
    case "CRITIQUE":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Mission lifecycle actions
const handleAcceptMission = async () => {
  if (!missionStore.currentMission) return
  try {
    await missionStore.acceptMission(missionStore.currentMission.id)
  } catch (error) {
    console.error('Error accepting mission:', error)
  }
}

const handleRefuseMission = async (reason: string) => {
  if (!missionStore.currentMission) return
  if (!confirm('Êtes-vous sûr de vouloir refuser cette mission ?')) return

  try {
    await missionStore.refuseMission(missionStore.currentMission.id, reason)
  } catch (error) {
    console.error('Error refusing mission:', error)
  }
}

const handleStartMission = async () => {
  if (!missionStore.currentMission) return
  try {
    await missionStore.startMission(missionStore.currentMission.id)
  } catch (error) {
    console.error('Error starting mission:', error)
  }
}

const handleCompleteMission = async (message: string) => {
  if (!missionStore.currentMission) return
  if (!confirm('Êtes-vous sûr que cette mission est terminée ?')) return

  try {
    await missionStore.completeMission(missionStore.currentMission.id, message)
  } catch (error) {
    console.error('Error completing mission:', error)
  }
}

const handleSuspendMission = async (reason: string) => {
  if (!missionStore.currentMission) return
  if (!confirm('Êtes-vous sûr de vouloir suspendre cette mission ?')) return

  try {
    await missionStore.suspendMission(missionStore.currentMission.id, reason)
  } catch (error) {
    console.error('Error suspending mission:', error)
  }
}

const handleResumeMission = async () => {
  if (!missionStore.currentMission) return
  try {
    await missionStore.resumeMission(missionStore.currentMission.id)
  } catch (error) {
    console.error('Error resuming mission:', error)
  }
}

const handleValidateMission = async () => {
  if (!missionStore.currentMission) return
  if (!confirm('Êtes-vous sûr de vouloir valider cette mission ?')) return

  try {
    await missionStore.validateMissionCompletion(missionStore.currentMission.id)
  } catch (error) {
    console.error('Error validating mission:', error)
  }
}

const handleCancelMission = async () => {
  if (!missionStore.currentMission) return
  if (!confirm('Êtes-vous sûr de vouloir annuler cette mission ?')) return

  try {
    const cancelledBy = isPrestataire.value ? 'prestataire' : 'assureur'
    await missionStore.cancelMission(missionStore.currentMission.id, 'Mission annulée', cancelledBy)
  } catch (error) {
    console.error('Error canceling mission:', error)
  }
}

const handleSubmitRating = async (data: { rating: number; comment: string }) => {
  if (!missionStore.currentMission) return
  
  try {
    await missionStore.rateMission(missionStore.currentMission.id, data.rating, data.comment)
    showRatingDialog.value = false
    rating.value = 0
    ratingComment.value = ''
  } catch (error) {
    console.error('Error rating mission:', error)
  }
}

// Event handlers for child components
const handleDocumentAdded = (document: any) => {
  // The mission store will handle refreshing the mission details
  loadMissionDetails()
}

const handleCommentAdded = (comment: any) => {
  // The mission store will handle refreshing the mission details
  loadMissionDetails()
}

const handleCommentsRefresh = () => {
  // Trigger refresh using mission store
  loadMissionDetails()
}

// Check what actions are available based on mission status and user role
const availableActions = computed(() => {
  if (!missionStore.currentMission || !authStore.user) return []
  
  const actions = []
  const status = missionStore.currentMission.status
  
  if (isPrestataire.value) {
    if (status === 'EN_ATTENTE') {
      actions.push('accept', 'refuse')
    } else if (status === 'ASSIGNEE') {
      actions.push('start', 'cancel')
    } else if (status === 'EN_COURS') {
      actions.push('complete', 'cancel')
    }
  } else if (isAssureur.value) {
    if (status !== 'COMPLETEE') {
      actions.push('suspend', 'cancel')
    }
    if (status === 'SUSPENDUE') {
      actions.push('resume')
    }
    if (status === 'COMPLETEE') {
      actions.push('validate', 'rate')
    }
  }
  
  return actions
})
</script>

<template>
  <div class="p-6 space-y-4">
    <!-- Header -->
    <MissionHeader 
      :mission="missionStore.currentMission" 
      :mission-id="missionId" 
      @go-back="goBack" 
    />

    <!-- Action Buttons -->
    <MissionActionButtons
      :available-actions="availableActions"
      :loading="missionStore.isLoading"
      @accept-mission="handleAcceptMission"
      @refuse-mission="handleRefuseMission"
      @start-mission="handleStartMission"
      @complete-mission="handleCompleteMission"
      @suspend-mission="handleSuspendMission"
      @resume-mission="handleResumeMission"
      @validate-mission="handleValidateMission"
      @rate-mission="showRatingDialog = true"
      @cancel-mission="handleCancelMission"
    />

    <!-- Loading State -->
    <div v-if="missionStore.loadingStates.missionDetails" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des détails...</p>
      </div>
    </div>

    <!-- Mission Details -->
    <div v-else-if="missionStore.currentMission" class="space-y-8">
      <!-- Mission Overview Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MissionClientInfo :mission="missionStore.currentMission" />
        <MissionWorksiteInfo :mission="missionStore.currentMission" />
      </div>

      <!-- Incident and Mission Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MissionIncidentInfo :mission="missionStore.currentMission" />
        <MissionSummary :mission="missionStore.currentMission" />
      </div>

      <!-- Detailed Mission Information -->
      <MissionDetailedInfo :mission="missionStore.currentMission" />

      <!-- Participants -->
      <MissionParticipants 
        v-if="missionStore.currentMission.societaire || missionStore.currentMission.prestataire" 
        :mission="missionStore.currentMission" 
      />

      <!-- Submissions Section (Assureurs only) -->
      <div v-if="isAssureur" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center space-x-2">
                <Briefcase class="w-5 h-5" />
                <span>Sous-missions ({{ missionStore.subMissions.length }})</span>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                @click="openCreateSubMissionDialog"
                data-testid="create-sub-mission-button"
              >
                <Plus class="w-4 h-4 mr-2" />
                Créer une sous-mission
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <!-- Loading state for sub-missions -->
            <div v-if="missionStore.loadingStates.fetchSubMissions" class="flex items-center justify-center py-8">
              <div class="text-center">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                <p class="mt-2 text-sm text-gray-600">Chargement des sous-missions...</p>
              </div>
            </div>

            <!-- Sub-missions table -->
            <div v-else-if="missionStore.subMissions.length > 0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre & Spécialisation</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Urgence</TableHead>
                    <TableHead>Coût & Durée</TableHead>
                    <TableHead>Prestataire</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow 
                    v-for="subMission in missionStore.subMissions" 
                    :key="subMission.id"
                    class="hover:bg-gray-50 cursor-pointer"
                    @click="viewSubMissionDetails(subMission.id)"
                    :data-testid="`sub-mission-row-${subMission.id}`"
                  >
                    <TableCell>
                      <div>
                        <p class="font-semibold text-sm">{{ subMission.title }}</p>
                        <p class="text-xs text-gray-600">{{ subMission.specialization }}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p class="text-sm text-gray-700 line-clamp-2 max-w-xs">{{ subMission.description }}</p>
                    </TableCell>
                    <TableCell>
                      <Badge :class="getSubMissionStatusClass(subMission.statut)" class="text-xs">
                        {{ getSubMissionStatusText(subMission.statut) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge :class="getUrgenceClass(subMission.urgence)" class="text-xs">
                        {{ subMission.urgence }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div class="text-sm text-gray-600 space-y-1">
                        <div v-if="subMission.estimatedCost" class="flex items-center">
                          <Euro class="w-3 h-3 mr-1" />
                          {{ subMission.estimatedCost }}€
                        </div>
                        <div v-if="subMission.estimatedDurationHours" class="flex items-center">
                          <Clock class="w-3 h-3 mr-1" />
                          {{ subMission.estimatedDurationHours }}h
                        </div>
                        <div v-if="!subMission.estimatedCost && !subMission.estimatedDurationHours" class="text-gray-400">-</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div v-if="subMission.prestataireId" class="flex items-center text-sm">
                        <User class="w-3 h-3 mr-1 text-gray-500" />
                        <span class="text-green-600">Assignée</span>
                      </div>
                      <span v-else class="text-sm text-gray-400">Non assignée</span>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center text-sm text-gray-600">
                        <Calendar class="w-3 h-3 mr-1" />
                        {{ new Date(subMission.createdAt).toLocaleDateString() }}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="sm" @click.stop>
                            <MoreHorizontal class="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click.stop="viewSubMissionDetails(subMission.id)">
                            <Eye class="w-4 h-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem @click.stop="viewSubMissionDetails(subMission.id)">
                            <FileText class="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <!-- Empty state for sub-missions -->
            <div v-else class="text-center py-8">
              <Briefcase class="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p class="text-gray-500 mb-4">Aucune sous-mission créée</p>
              <Button variant="outline" @click="openCreateSubMissionDialog">
                <Plus class="w-4 h-4 mr-2" />
                Créer la première sous-mission
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Documents Section -->
      <MissionDocuments 
        :mission-id="missionId"
        :can-upload="true"
        :can-delete="isAssureur"
        :loading="missionStore.loadingStates.uploadDocument"
        @document-added="handleDocumentAdded"
        data-testid="mission-documents"
      />

      <!-- Comments Section -->
      <MissionComments 
        :mission-id="missionId"
        :comments="missionStore.comments"
        :can-comment="true"
        @comment-added="handleCommentAdded"
        @refresh-requested="handleCommentsRefresh"
        data-testid="mission-comments"
      />

      <!-- History Section -->
      <MissionHistory 
        :history="missionStore.history"
        data-testid="mission-history"
      />

      <!-- Quick Actions -->
      <MissionQuickActions 
        @upload-document="() => console.log('Upload document')"
        @new-message="() => console.log('New message')"
        @schedule-appointment="() => console.log('Schedule appointment')"
        @report-issue="() => console.log('Report issue')"
      />
    </div>

    <!-- Rating Dialog -->
    <MissionRatingDialog
      :is-open="showRatingDialog"
      :rating="rating"
      :rating-comment="ratingComment"
      @update:open="showRatingDialog = $event"
      @update:rating="rating = $event"
      @update:comment="ratingComment = $event"
      @submit="handleSubmitRating"
    />
  </div>
</template>