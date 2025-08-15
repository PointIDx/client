import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@vue/apollo-composable'
import type { Mission } from '@/interfaces/mission'
import type { MissionDetails } from '@/interfaces/MissionDetails'
import { useAuthStore } from '@/stores/auth'
import { handleError, handleGraphQLError, showSuccess } from '@/utils/error-handling'

// GraphQL imports
import { GET_MISSION_DETAILS_QUERY } from '@/graphql/queries/get-mission-details'
import { GET_ASSUREUR_MISSIONS_ENHANCED_QUERY } from '@/graphql/queries/get-assureur-missions-enhanced'
import { GET_PRESTATAIRE_MISSIONS_ENHANCED_QUERY } from '@/graphql/queries/get-prestataire-missions-enhanced'
import { CREATE_MISSION_MUTATION } from '@/graphql/mutations/create-mission'
import { UPDATE_MISSION_STATUS_MUTATION } from '@/graphql/mutations/update-mission-status'
import {
  ACCEPT_MISSION_ENHANCED_MUTATION,
  REFUSE_MISSION_MUTATION,
  START_MISSION_MUTATION,
  COMPLETE_MISSION_MUTATION,
  SUSPEND_MISSION_MUTATION,
  RESUME_MISSION_MUTATION,
  VALIDATE_MISSION_COMPLETION_MUTATION,
  CANCEL_MISSION_MUTATION,
  RATE_PRESTATAIRE_MUTATION
} from '@/graphql/mutations/mission-lifecycle'
import {
  GET_MISSION_DOCUMENTS_QUERY,
  GET_DOCUMENT_DOWNLOAD_URL_QUERY
} from '@/graphql/queries/mission-documents'
import {
  UPLOAD_MISSION_DOCUMENT_MUTATION
} from '@/graphql/mutations/mission-documents'
import { EXPORT_MISSIONS_QUERY, EXPORT_MISSION_DETAILS_QUERY, type ExportFilters, type ExportFormat } from '@/graphql/queries/export-missions'
import { EXPORT_PRESTATAIRE_MISSIONS_QUERY, EXPORT_PRESTATAIRE_REPORT_QUERY, type PrestataireExportFilters, type ReportPeriod } from '@/graphql/queries/export-prestataire-missions'
import { GET_SUB_MISSIONS_BY_MISSION, GET_SUB_MISSION_DETAILS, GET_PRESTATAIRE_SUB_MISSIONS, GET_AVAILABLE_SUB_MISSIONS } from '@/graphql/queries/get-sub-missions'
import { CREATE_SUB_MISSION, ASSIGN_SUB_MISSION, UPDATE_SUB_MISSION, UPDATE_SUB_MISSION_STATUS, ACCEPT_SUB_MISSION } from '@/graphql/mutations/sub-mission-operations'
import type { SubMission, SubMissionDetails, SubMissionCreateInput, SubMissionAssignInput, SubMissionUpdateInput, SubMissionStatusUpdateInput } from '@/interfaces/sub-mission'

export const useMissionStore = defineStore('mission', () => {
  const { client } = useApolloClient()
  const authStore = useAuthStore()

  // State
  const missions = ref<MissionDetails[]>([])
  const currentMission = ref<MissionDetails | null>(null)
  const documents = ref<any[]>([])
  const comments = ref<any[]>([])
  const history = ref<any[]>([])
  const subMissions = ref<SubMission[]>([])
  const currentSubMission = ref<SubMissionDetails | null>(null)

  // Loading states
  const loadingStates = ref({
    missions: false,
    missionDetails: false,
    subMissions: false,
    createSubMission: false,
    assignSubMission: false,
    acceptSubMission: false,
    updateSubMission: false,
    updateSubMissionStatus: false,
    fetchSubMissions: false,
    createMission: false,
    updateStatus: false,
    acceptMission: false,
    refuseMission: false,
    startMission: false,
    completeMission: false,
    suspendMission: false,
    resumeMission: false,
    validateMission: false,
    cancelMission: false,
    rateMission: false,
    uploadDocument: false,
    downloadDocument: false,
    exportMissions: false,
    exportMissionDetails: false,
    exportPrestataireReport: false
  })

  // Computed properties
  const isLoading = computed(() => Object.values(loadingStates.value).some(Boolean))
  
  // Individual loading state getters
  const isLoadingMissions = computed(() => loadingStates.value.missions)
  const isLoadingMissionDetails = computed(() => loadingStates.value.missionDetails)
  const isCreatingMission = computed(() => loadingStates.value.createMission)
  const isUpdatingStatus = computed(() => loadingStates.value.updateStatus)
  const isAcceptingMission = computed(() => loadingStates.value.acceptMission)
  const isRefusingMission = computed(() => loadingStates.value.refuseMission)
  const isStartingMission = computed(() => loadingStates.value.startMission)
  const isCompletingMission = computed(() => loadingStates.value.completeMission)
  const isSuspendingMission = computed(() => loadingStates.value.suspendMission)
  const isResumingMission = computed(() => loadingStates.value.resumeMission)
  const isValidatingMission = computed(() => loadingStates.value.validateMission)
  const isCancellingMission = computed(() => loadingStates.value.cancelMission)
  const isRatingMission = computed(() => loadingStates.value.rateMission)
  const isUploadingDocument = computed(() => loadingStates.value.uploadDocument)
  const isDownloadingDocument = computed(() => loadingStates.value.downloadDocument)
  const isExportingMissions = computed(() => loadingStates.value.exportMissions)
  const isExportingMissionDetails = computed(() => loadingStates.value.exportMissionDetails)
  const isExportingPrestataireReport = computed(() => loadingStates.value.exportPrestataireReport)
  const isLoadingSubMissions = computed(() => loadingStates.value.fetchSubMissions)
  const isCreatingSubMission = computed(() => loadingStates.value.createSubMission)
  const isAssigningSubMission = computed(() => loadingStates.value.assignSubMission)
  const isUpdatingSubMission = computed(() => loadingStates.value.updateSubMission)
  const isUpdatingSubMissionStatus = computed(() => loadingStates.value.updateSubMissionStatus)
  
  const missionsByStatus = computed(() => {
    const grouped: Record<string, MissionDetails[]> = {}
    missions.value.forEach(mission => {
      if (!grouped[mission.status]) {
        grouped[mission.status] = []
      }
      grouped[mission.status].push(mission)
    })
    return grouped
  })

  // Helper function to set loading state
  const setLoading = (operation: keyof typeof loadingStates.value, loading: boolean) => {
    loadingStates.value[operation] = loading
  }

  // Helper function to get user type
  const getUserType = (): 'ASSUREUR' | 'PRESTATAIRE' | null => {
    return authStore.user?.accountType === 'ASSUREUR' ? 'ASSUREUR' :
           authStore.user?.accountType === 'PRESTATAIRE' ? 'PRESTATAIRE' : 
           null
  }

  // Mission fetching functions
  const fetchMissions = async (userType?: 'ASSUREUR' | 'PRESTATAIRE') => {
    if (!authStore.user?.id) {
      console.warn('No authenticated user found, cannot fetch missions')
      return
    }

    // Auto-detect user type if not provided
    const detectedUserType = userType || getUserType()
    if (!detectedUserType) {
      console.warn('Unable to determine user type for mission fetching')
      return
    }

    setLoading('missions', true)
    try {
      if (detectedUserType === 'PRESTATAIRE') {
        // For prestataires, fetch sub-missions instead of missions
        await fetchPrestataireSubMissions()
      } else {
        // For assureurs, use the regular missions query
        const { onResult, onError } = useQuery(GET_ASSUREUR_MISSIONS_ENHANCED_QUERY)

        onResult((queryResult) => {
          console.log('🔍 GraphQL assureur missions query result:', queryResult)
          if (queryResult.data) {
            const missionData = queryResult.data.getAssureurMissionsEnhanced
            console.log('✅ Assureur missions data received:', missionData)
            console.log('📊 Number of missions:', missionData?.length || 0)
            missions.value = missionData || []
          } else {
            console.log('❌ No missions data in response')
          }
        })

        onError((error) => {
          console.error('❌ GraphQL Error fetching assureur missions:', error)
          handleGraphQLError(error, 'Fetch Missions', { showToast: true })
        })
      }
    } catch (error) {
      handleError(error, 'Fetch Missions', { showToast: true })
    } finally {
      setLoading('missions', false)
    }
  }

  // Fetch sub-missions for prestataires (modern approach)
  const fetchPrestataireSubMissions = async () => {
    if (!authStore.user?.id) {
      console.warn('No authenticated user found, cannot fetch sub-missions')
      return
    }

    setLoading('fetchSubMissions', true)
    try {
      // Fetch both available sub-missions and assigned sub-missions
      const [availableResult, assignedResult] = await Promise.all([
        // Get available sub-missions that can be accepted
        client.query({
          query: GET_AVAILABLE_SUB_MISSIONS,
          variables: { specialization: null }, // Get all available sub-missions
          fetchPolicy: 'no-cache' // Force fresh data from server
        }),
        // Get sub-missions already assigned to this prestataire  
        client.query({
          query: GET_PRESTATAIRE_SUB_MISSIONS,
          variables: { prestataireId: null }, // Let server auto-detect prestataire_id
          fetchPolicy: 'no-cache' // Force fresh data from server
        })
      ])

      console.log('🔍 Available sub-missions result:', availableResult)
      console.log('🔍 Assigned sub-missions result:', assignedResult)

      const availableSubMissions = availableResult.data?.getAvailableSubMissions || []
      const assignedSubMissions = assignedResult.data?.getPrestataireSubMissions || []

      console.log('🔍 Raw available sub-missions:', availableSubMissions)
      console.log('🔍 Raw assigned sub-missions:', assignedSubMissions)

      // Combine both available and assigned sub-missions
      const allSubMissions = [...availableSubMissions, ...assignedSubMissions]
      
      console.log('✅ Available sub-missions count:', availableSubMissions.length)
      console.log('✅ Assigned sub-missions count:', assignedSubMissions.length)
      console.log('📊 Total sub-missions count:', allSubMissions.length)
      
      // Log details about each sub-mission for debugging
      allSubMissions.forEach((sm, index) => {
        console.log(`📝 Sub-mission ${index + 1}:`, {
          id: sm.id,
          reference: sm.reference,
          title: sm.title,
          statut: sm.statut,
          prestataireId: sm.prestataireId,
          specialization: sm.specialization
        })
      })
      
      // Store combined sub-missions in the missions array for compatibility with existing UI
      missions.value = allSubMissions
      
    } catch (error) {
      console.error('❌ Error fetching sub-missions:', error)
      handleError(error, 'Fetch Sub-Missions', { showToast: true })
    } finally {
      setLoading('fetchSubMissions', false)
    }
  }

  const fetchMissionDetails = async (missionId: string) => {
    if (!missionId) return

    setLoading('missionDetails', true)
    try {
      const { onResult, onError } = useQuery(GET_MISSION_DETAILS_QUERY, { missionId })

      onResult((queryResult) => {
        if (queryResult.data?.getMissionDetails) {
          currentMission.value = queryResult.data.getMissionDetails
          console.log('📋 Mission details loaded:', currentMission.value)
          
          // Initialize related data
          documents.value = currentMission.value?.documents || []
          comments.value = currentMission.value?.commentaires || []
          history.value = currentMission.value?.historique || []
        }
      })

      onError((error) => {
        console.error('❌ Error loading mission details:', error)
        handleGraphQLError(error, 'Fetch Mission Details', { showToast: true })
      })
    } catch (error) {
      handleError(error, 'Fetch Mission Details', { showToast: true })
    } finally {
      setLoading('missionDetails', false)
    }
  }

  // Mission lifecycle mutations
  const { mutate: createMissionMutation } = useMutation(CREATE_MISSION_MUTATION)
  const { mutate: updateMissionStatusMutation } = useMutation(UPDATE_MISSION_STATUS_MUTATION)
  const { mutate: acceptMissionMutation } = useMutation(ACCEPT_MISSION_ENHANCED_MUTATION)
  const { mutate: refuseMissionMutation } = useMutation(REFUSE_MISSION_MUTATION)
  const { mutate: startMissionMutation } = useMutation(START_MISSION_MUTATION)
  const { mutate: completeMissionMutation } = useMutation(COMPLETE_MISSION_MUTATION)
  const { mutate: suspendMissionMutation } = useMutation(SUSPEND_MISSION_MUTATION)
  const { mutate: resumeMissionMutation } = useMutation(RESUME_MISSION_MUTATION)
  const { mutate: validateMissionMutation } = useMutation(VALIDATE_MISSION_COMPLETION_MUTATION)
  const { mutate: cancelMissionMutation } = useMutation(CANCEL_MISSION_MUTATION)
  const { mutate: rateMissionMutation } = useMutation(RATE_PRESTATAIRE_MUTATION)

  // Mission creation
  const createMission = async (missionData: any) => {
    setLoading('createMission', true)
    try {
      const result = await createMissionMutation({ input: missionData })
      if (result?.data?.createMission) {
        showSuccess('Mission créée avec succès')
        // Refresh missions list with proper user type
        const userType = authStore.user?.accountType as 'ASSUREUR' | 'PRESTATAIRE' | undefined
        if (userType && (userType === 'ASSUREUR' || userType === 'PRESTATAIRE')) {
          await fetchMissions(userType)
        }
        return result.data.createMission
      }
    } catch (error) {
      handleGraphQLError(error, 'Create Mission', { showToast: true })
      throw error
    } finally {
      setLoading('createMission', false)
    }
  }

  // Mission status updates
  const updateMissionStatus = async (missionId: string, status: string) => {
    const userType = getUserType()
    setLoading('updateStatus', true)
    try {
      await updateMissionStatusMutation({ missionId, status })
      // Refresh missions with correct user type
      if (userType) {
        await fetchMissions(userType)
      } else {
        await fetchMissions()
      }
      showSuccess('Statut de la mission mis à jour')
    } catch (error) {
      handleGraphQLError(error, 'Update Mission Status', { showToast: true })
      throw error
    } finally {
      setLoading('updateStatus', false)
    }
  }

  // Prestataire actions
  const acceptMission = async (missionId: string, estimatedCompletionDate?: string, comment?: string) => {
    const userType = getUserType()
    if (!userType) {
      throw new Error('Unable to determine user type for mission acceptance')
    }

    setLoading('acceptMission', true)
    try {
      if (userType === 'PRESTATAIRE') {
        // For prestataires, use acceptSubMission mutation instead of acceptMission
        // The missionId is actually the sub-mission ID in the prestataire context
        await acceptSubMission(missionId)
      } else if (userType === 'ASSUREUR') {
        // Assureurs use the regular accept mission mutation
        await acceptMissionMutation({
          input: {
            missionId,
            estimatedCompletionDate,
            comment
          }
        })
      }
      
      // Refresh missions with correct user type
      await fetchMissions(userType)
      showSuccess('Mission acceptée avec succès')
    } catch (error) {
      handleGraphQLError(error, 'Accept Mission', { showToast: true })
      throw error
    } finally {
      setLoading('acceptMission', false)
    }
  }

  const refuseMission = async (missionId: string, reason: string) => {
    const userType = getUserType()
    setLoading('refuseMission', true)
    try {
      await refuseMissionMutation({
        input: {
          missionId,
          reason
        }
      })
      // Refresh missions with correct user type
      if (userType) {
        await fetchMissions(userType)
      } else {
        await fetchMissions()
      }
      showSuccess('Mission refusée')
    } catch (error) {
      handleGraphQLError(error, 'Refuse Mission', { showToast: true })
      throw error
    } finally {
      setLoading('refuseMission', false)
    }
  }

  const startMission = async (missionId: string, startComment?: string) => {
    const userType = getUserType()
    setLoading('startMission', true)
    try {
      await startMissionMutation({
        input: {
          missionId,
          startComment
        }
      })
      if (userType) {
        await fetchMissions(userType)
      } else {
        await fetchMissions()
      }
      showSuccess('Mission démarrée')
    } catch (error) {
      handleGraphQLError(error, 'Start Mission', { showToast: true })
      throw error
    } finally {
      setLoading('startMission', false)
    }
  }

  const completeMission = async (missionId: string, completionComment: string, actualCost?: number, completionPhotos?: string[]) => {
    setLoading('completeMission', true)
    try {
      await completeMissionMutation({
        input: {
          missionId,
          completionComment,
          actualCost,
          completionPhotos
        }
      })
      await fetchMissions()
      showSuccess('Mission terminée avec succès')
    } catch (error) {
      handleGraphQLError(error, 'Complete Mission', { showToast: true })
      throw error
    } finally {
      setLoading('completeMission', false)
    }
  }

  // Assureur actions
  const suspendMission = async (missionId: string, suspensionReason: string, expectedResumeDate?: string) => {
    setLoading('suspendMission', true)
    try {
      await suspendMissionMutation({
        input: {
          missionId,
          suspensionReason,
          expectedResumeDate
        }
      })
      await fetchMissions()
      showSuccess('Mission suspendue')
    } catch (error) {
      handleGraphQLError(error, 'Suspend Mission', { showToast: true })
      throw error
    } finally {
      setLoading('suspendMission', false)
    }
  }

  const resumeMission = async (missionId: string, resumeComment?: string) => {
    setLoading('resumeMission', true)
    try {
      await resumeMissionMutation({
        input: {
          missionId,
          resumeComment
        }
      })
      await fetchMissions()
      showSuccess('Mission reprise')
    } catch (error) {
      handleGraphQLError(error, 'Resume Mission', { showToast: true })
      throw error
    } finally {
      setLoading('resumeMission', false)
    }
  }

  const validateMissionCompletion = async (missionId: string, validationComment?: string) => {
    setLoading('validateMission', true)
    try {
      await validateMissionMutation({
        missionId,
        validationComment
      })
      await fetchMissions()
      showSuccess('Mission validée')
    } catch (error) {
      handleGraphQLError(error, 'Validate Mission', { showToast: true })
      throw error
    } finally {
      setLoading('validateMission', false)
    }
  }

  const cancelMission = async (missionId: string, cancellationReason: string, cancelledBy: 'assureur' | 'prestataire') => {
    setLoading('cancelMission', true)
    try {
      await cancelMissionMutation({
        input: {
          missionId,
          cancellationReason,
          cancelledBy
        }
      })
      await fetchMissions()
      showSuccess('Mission annulée')
    } catch (error) {
      handleGraphQLError(error, 'Cancel Mission', { showToast: true })
      throw error
    } finally {
      setLoading('cancelMission', false)
    }
  }

  const rateMission = async (missionId: string, rating: number, comment?: string) => {
    setLoading('rateMission', true)
    try {
      const result = await rateMissionMutation({
        input: {
          missionId,
          rating,
          comment
        }
      })
      
      if (result?.data?.ratePrestataire) {
        showSuccess('Prestataire évalué avec succès')
        return result.data.ratePrestataire
      }
    } catch (error) {
      handleGraphQLError(error, 'Rate Mission', { showToast: true })
      throw error
    } finally {
      setLoading('rateMission', false)
    }
  }

  // Document management
  const { mutate: uploadDocumentMutation } = useMutation(UPLOAD_MISSION_DOCUMENT_MUTATION)

  const uploadMissionDocument = async (input: any) => {
    setLoading('uploadDocument', true)
    try {
      // Use direct fetch for file upload with multipart/form-data
      const formData = new FormData()
      
      // Add the GraphQL operation
      formData.append('operations', JSON.stringify({
        query: `
          mutation UploadMissionDocument($input: MissionDocumentInput!) {
            uploadMissionDocument(input: $input) {
              id
              filename
              url
              contentType
              size
              uploadDate
              description
              uploadedBy
            }
          }
        `,
        variables: {
          input: {
            missionId: input.missionId,
            filename: input.file.name,
            contentType: input.file.type || 'application/octet-stream',
            size: input.file.size,
            description: input.description
          }
        }
      }))
      
      // Map the file to the correct variable
      formData.append('map', JSON.stringify({
        '0': ['variables.input.file']
      }))
      
      // Add the actual file
      formData.append('0', input.file)
      
      // Get auth token
      const tokens = authStore.tokens
      
      // Make the request
      const response = await fetch(import.meta.env.VITE_APP_SERVER_GRAPHQL_URL || '/graphql', {
        method: 'POST',
        headers: {
          'Authorization': tokens?.token ? `Bearer ${tokens.token}` : ''
        },
        body: formData
      })
      
      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload response not ok:', response.status, response.statusText, errorText)
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`)
      }
      
      // Get response text first to debug
      const responseText = await response.text()
      console.log('Upload response text:', responseText)
      
      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        console.error('Response was:', responseText)
        throw new Error(`Server returned invalid JSON response: ${responseText.substring(0, 200)}`)
      }
      
      if (result.data?.uploadMissionDocument) {
        showSuccess('Document uploadé avec succès')
        // Refresh documents
        if (currentMission.value) {
          await fetchMissionDetails(currentMission.value.id)
        }
        return result.data.uploadMissionDocument
      } else if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Upload failed')
      } else {
        throw new Error('Unknown upload error')
      }
    } catch (error) {
      handleGraphQLError(error, 'Upload Mission Document', { showToast: true })
      throw error
    } finally {
      setLoading('uploadDocument', false)
    }
  }

  const downloadDocument = async (documentId: string) => {
    setLoading('downloadDocument', true)
    try {
      const { onResult, onError } = useQuery(GET_DOCUMENT_DOWNLOAD_URL_QUERY, { documentId })
      
      onResult((queryResult) => {
        if (queryResult.data?.getDocumentDownloadUrl) {
          const { url } = queryResult.data.getDocumentDownloadUrl
          // Trigger download
          const link = document.createElement('a')
          link.href = url
          link.click()
        }
      })
      
      onError((error) => {
        handleGraphQLError(error, 'Download Document', { showToast: true })
      })
    } catch (error) {
      handleError(error, 'Download Document', { showToast: true })
    } finally {
      setLoading('downloadDocument', false)
    }
  }

  // Export functionality
  const exportMissions = (filters: ExportFilters, format: ExportFormat = 'pdf') => {
    setLoading('exportMissions', true)
    
    const { onResult, onError } = useQuery(EXPORT_MISSIONS_QUERY, { filters, format }, { fetchPolicy: 'network-only' })

    onResult((queryResult) => {
      if (queryResult.data?.exportMissions) {
        const { url, filename } = queryResult.data.exportMissions
        // Download the file
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showSuccess('Export généré avec succès')
      }
    })

    onError((error) => {
      console.error('Error exporting missions:', error)
      handleGraphQLError(error, 'Export Missions', { showToast: true })
    })

    // Always set loading to false after query setup
    setTimeout(() => setLoading('exportMissions', false), 100)
  }

  const exportMissionDetails = (missionId: string, format: ExportFormat = 'pdf') => {
    setLoading('exportMissionDetails', true)
    
    const { onResult, onError } = useQuery(EXPORT_MISSION_DETAILS_QUERY, { missionId, format }, { fetchPolicy: 'network-only' })

    onResult((queryResult) => {
      if (queryResult.data?.exportMissionDetails) {
        const { url, filename } = queryResult.data.exportMissionDetails
        // Download the file
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showSuccess('Export de la mission généré avec succès')
      }
    })

    onError((error) => {
      console.error('Error exporting mission details:', error)
      handleGraphQLError(error, 'Export Mission Details', { showToast: true })
    })

    // Always set loading to false after query setup
    setTimeout(() => setLoading('exportMissionDetails', false), 100)
  }

  const exportPrestataireMissions = (filters: PrestataireExportFilters, format: ExportFormat = 'pdf') => {
    setLoading('exportMissions', true)
    
    const { onResult, onError } = useQuery(EXPORT_PRESTATAIRE_MISSIONS_QUERY, { filters, format }, { fetchPolicy: 'network-only' })

    onResult((queryResult) => {
      if (queryResult.data?.exportPrestataireMissions) {
        const { url, filename } = queryResult.data.exportPrestataireMissions
        // Download the file
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        showSuccess('Export généré avec succès')
      }
    })

    onError((error) => {
      handleGraphQLError(error, 'Export Missions', { showToast: true })
    })

    // Always set loading to false after query setup
    setTimeout(() => setLoading('exportMissions', false), 100)
  }

  const exportPrestataireReport = (period: ReportPeriod, format: ExportFormat = 'pdf') => {
    setLoading('exportPrestataireReport', true)
    
    const { onResult, onError } = useQuery(EXPORT_PRESTATAIRE_REPORT_QUERY, { period, format }, { fetchPolicy: 'network-only' })

    onResult((queryResult) => {
      if (queryResult.data?.exportPrestataireReport) {
        const { url, filename } = queryResult.data.exportPrestataireReport
        // Download the file
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        showSuccess('Rapport généré avec succès')
      }
    })

    onError((error) => {
      handleGraphQLError(error, 'Export Report', { showToast: true })
    })

    // Always set loading to false after query setup
    setTimeout(() => setLoading('exportPrestataireReport', false), 100)
  }

  // Utility functions
  const getMissionById = (id: string) => {
    return missions.value.find(mission => mission.id === id) || null
  }

  const clearCurrentMission = () => {
    currentMission.value = null
    documents.value = []
    comments.value = []
    history.value = []
  }

  const refreshMissions = async () => {
    const userType = authStore.user?.accountType as 'ASSUREUR' | 'PRESTATAIRE' | undefined
    if (userType && (userType === 'ASSUREUR' || userType === 'PRESTATAIRE')) {
      await fetchMissions(userType)
    }
  }

  // Sub-mission management
  const { mutate: createSubMissionMutation } = useMutation(CREATE_SUB_MISSION)
  const { mutate: assignSubMissionMutation } = useMutation(ASSIGN_SUB_MISSION)
  const { mutate: acceptSubMissionMutation } = useMutation(ACCEPT_SUB_MISSION)
  const { mutate: updateSubMissionMutation } = useMutation(UPDATE_SUB_MISSION)
  const { mutate: updateSubMissionStatusMutation } = useMutation(UPDATE_SUB_MISSION_STATUS)

  const createSubMission = async (input: SubMissionCreateInput): Promise<SubMission | null> => {
    setLoading('createSubMission', true)
    try {
      const result = await createSubMissionMutation({
        input
      })
      
      if (result?.data?.createSubMission) {
        showSuccess('Sous-mission créée avec succès')
        return result.data.createSubMission
      }
      return null
    } catch (error) {
      handleGraphQLError(error, 'Create SubMission', { showToast: true })
      throw error
    } finally {
      setLoading('createSubMission', false)
    }
  }

  const assignSubMission = async (input: SubMissionAssignInput): Promise<SubMission | null> => {
    setLoading('assignSubMission', true)
    try {
      const result = await assignSubMissionMutation({
        input
      })
      
      if (result?.data?.assignSubMission) {
        showSuccess('Sous-mission assignée avec succès')
        return result.data.assignSubMission
      }
      return null
    } catch (error) {
      handleGraphQLError(error, 'Assign SubMission', { showToast: true })
      throw error
    } finally {
      setLoading('assignSubMission', false)
    }
  }

  const acceptSubMission = async (subMissionId: string): Promise<SubMission | null> => {
    setLoading('acceptSubMission', true)
    try {
      const result = await acceptSubMissionMutation({
        subMissionId
      })
      
      if (result?.data?.acceptSubMission) {
        showSuccess('Sous-mission acceptée avec succès')
        return result.data.acceptSubMission
      }
      return null
    } catch (error) {
      handleGraphQLError(error, 'Accept SubMission', { showToast: true })
      throw error
    } finally {
      setLoading('acceptSubMission', false)
    }
  }

  const updateSubMission = async (input: SubMissionUpdateInput): Promise<SubMission | null> => {
    setLoading('updateSubMission', true)
    try {
      const result = await updateSubMissionMutation({
        input
      })
      
      if (result?.data?.updateSubMission) {
        showSuccess('Sous-mission mise à jour avec succès')
        return result.data.updateSubMission
      }
      return null
    } catch (error) {
      handleGraphQLError(error, 'Update SubMission', { showToast: true })
      throw error
    } finally {
      setLoading('updateSubMission', false)
    }
  }

  const updateSubMissionStatus = async (input: SubMissionStatusUpdateInput): Promise<SubMission | null> => {
    setLoading('updateSubMissionStatus', true)
    try {
      const result = await updateSubMissionStatusMutation({
        input
      })
      
      if (result?.data?.updateSubMissionStatus) {
        showSuccess('Statut de la sous-mission mis à jour avec succès')
        return result.data.updateSubMissionStatus
      }
      return null
    } catch (error) {
      handleGraphQLError(error, 'Update SubMission Status', { showToast: true })
      throw error
    } finally {
      setLoading('updateSubMissionStatus', false)
    }
  }

  const fetchSubMissions = async (missionId: string): Promise<SubMission[]> => {
    setLoading('fetchSubMissions', true)
    try {
      console.log('🔍 Fetching sub-missions for mission:', missionId)
      const { data } = await client.query({
        query: GET_SUB_MISSIONS_BY_MISSION,
        variables: { missionId },
        fetchPolicy: 'network-only'
      })
      
      console.log('📝 Sub-missions query response:', data)
      
      if (data?.getSubMissionsByMission) {
        subMissions.value = data.getSubMissionsByMission
        console.log('✅ Sub-missions loaded:', data.getSubMissionsByMission)
        return data.getSubMissionsByMission
      }
      console.log('⚠️ No sub-missions found in response')
      return []
    } catch (error) {
      console.error('❌ Error fetching sub-missions:', error)
      handleGraphQLError(error, 'Fetch SubMissions')
      return []
    } finally {
      setLoading('fetchSubMissions', false)
    }
  }

  const fetchSubMissionDetails = async (subMissionId: string): Promise<SubMissionDetails | null> => {
    setLoading('subMissions', true)
    try {
      const { data } = await client.query({
        query: GET_SUB_MISSION_DETAILS,
        variables: { subMissionId },
        fetchPolicy: 'network-only'
      })
      
      if (data?.getSubMission) {
        currentSubMission.value = data.getSubMission
        return data.getSubMission
      }
      return null
    } catch (error) {
      handleGraphQLError(error, 'Fetch SubMission Details')
      return null
    } finally {
      setLoading('subMissions', false)
    }
  }

  return {
    // State
    missions,
    currentMission,
    documents,
    comments,
    history,
    subMissions,
    currentSubMission,
    loadingStates,
    
    // Computed
    isLoading,
    missionsByStatus,
    
    // Individual loading states for granular UI control
    isLoadingMissions,
    isLoadingMissionDetails,
    isCreatingMission,
    isUpdatingStatus,
    isAcceptingMission,
    isRefusingMission,
    isStartingMission,
    isCompletingMission,
    isSuspendingMission,
    isResumingMission,
    isValidatingMission,
    isCancellingMission,
    isRatingMission,
    isUploadingDocument,
    isDownloadingDocument,
    isExportingMissions,
    isExportingMissionDetails,
    isExportingPrestataireReport,
    isLoadingSubMissions,
    isCreatingSubMission,
    isAssigningSubMission,
    isUpdatingSubMission,
    isUpdatingSubMissionStatus,
    
    // Mission fetching
    fetchMissions,
    fetchMissionDetails,
    refreshMissions,
    
    // Mission lifecycle
    createMission,
    updateMissionStatus,
    acceptMission,
    refuseMission,
    startMission,
    completeMission,
    suspendMission,
    resumeMission,
    validateMissionCompletion,
    cancelMission,
    rateMission,
    
    // Document management
    uploadMissionDocument,
    downloadDocument,
    
    // Export functionality
    exportMissions,
    exportMissionDetails,
    exportPrestataireMissions,
    exportPrestataireReport,
    
    // Sub-mission management
    createSubMission,
    assignSubMission,
    acceptSubMission,
    updateSubMission,
    updateSubMissionStatus,
    fetchSubMissions,
    fetchSubMissionDetails,
    
    // Utilities
    getMissionById,
    clearCurrentMission
  }
})