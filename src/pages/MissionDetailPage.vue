<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-vue-next'
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

// Load mission details using the mission store
const loadMissionDetails = async () => {
  try {
    await missionStore.fetchMissionDetails(missionId)
  } catch (err) {
    console.error('❌ Error loading mission details:', err)
  }
}

// Initialize on mount
loadMissionDetails()

// Computed properties
const isAssureur = computed(() => authStore.user?.accountType === 'ASSUREUR')
const isPrestataire = computed(() => authStore.user?.accountType === 'PRESTATAIRE')
const isSocietaire = computed(() => authStore.user?.accountType === 'SOCIETAIRE')

const goBack = () => {
  if (isAssureur.value) {
    router.push('/assureur-dashboard')
  } else if (isPrestataire.value) {
    router.push('/prestataire-dashboard')
  } else {
    router.back()
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