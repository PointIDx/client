import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CompanyInfo } from '@/interfaces/company-info'
import type { Contact } from '@/interfaces/contact'
import type { ProviderInfo } from '@/interfaces/provider-info'
import type { Account } from '@/interfaces/account'
import { PRESTATAIRE_SIGNUP_MUTATION } from '@/graphql/mutations/prestataire-signup'
import { useApolloClient } from '@vue/apollo-composable'

import { GET_PRESTATAIRE_MISSIONS_QUERY } from '@/graphql/queries/get-prestataire-missions'
import { GET_MISSION_DETAILS_QUERY } from '@/graphql/queries/get-mission-details'
import type { MissionPrestataire } from '@/interfaces/mission-prestataire'
import type { Mission } from '@/interfaces/mission'

import { UPDATE_MISSION_STATUS_MUTATION } from '@/graphql/mutations/update-mission-status'
import { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire'

import { SEND_COMMENT_MUTATION } from '@/graphql/mutations/send-comment'
import { SEND_FILE } from '@/graphql/mutations/send-file'
import { ON_NEW_MESSAGE_SUBSCRIPTION } from '@/graphql/subscriptions/on-new-message'
import { GET_MESSAGES_QUERY } from '@/graphql/queries/get-messages'
import type { Message } from '@/interfaces/message'
import { MessageExpediteur } from '@/enums/message-expediteur'

// Import new GraphQL operations
import { GET_PRESTATAIRE_NOTIFICATIONS_QUERY, MARK_PRESTATAIRE_NOTIFICATION_READ_MUTATION, type PrestataireNotification } from '@/graphql/queries/get-prestataire-notifications'
import { GET_COMMUNICATION_REQUESTS_FOR_PRESTATAIRE_QUERY, RESPOND_TO_COMMUNICATION_REQUEST_MUTATION, type CommunicationRequestForPrestataire, type CommunicationResponseInput } from '@/graphql/queries/get-communication-requests-for-prestataire'
import { GET_PRESTATAIRE_STATISTICS_QUERY, type PrestataireStatistics } from '@/graphql/queries/get-prestataire-statistics'
import { EXPORT_PRESTATAIRE_MISSIONS_QUERY, EXPORT_PRESTATAIRE_REPORT_QUERY, type PrestataireExportFilters, type ReportPeriod, type ExportFormat } from '@/graphql/queries/export-prestataire-missions'
import { UPDATE_PRESTATAIRE_PROFILE_MUTATION, UPDATE_PRESTATAIRE_AVAILABILITY_MUTATION, type PrestataireProfileUpdateInput, type AvailabilityStatus } from '@/graphql/mutations/update-prestataire-profile'
import { SEND_FILE_WITH_MESSAGE_MUTATION, UPLOAD_MISSION_DOCUMENT_MUTATION, type FileMessageInput, type MissionDocumentInput } from '@/graphql/mutations/send-file-with-message'
import { ON_PRESTATAIRE_NOTIFICATION_SUBSCRIPTION, ON_NEW_MISSION_ASSIGNMENT_SUBSCRIPTION, ON_COMMUNICATION_REQUEST_SUBSCRIPTION } from '@/graphql/subscriptions/on-prestataire-notification'

// Import new utilities
import { fetchSiretInfo } from '@/utils/siret'
import { handleError, handleGraphQLError, showSuccess } from '@/utils/error-handling'

export const usePrestataireStore = defineStore('prestataire', () => {
  const companyInfo = ref<CompanyInfo | null>(null)
  const contact = ref<Contact | null>(null)
  const providerInfo = ref<ProviderInfo | null>(null)
  const email = ref('')
  const password = ref('')
  const siretValidated = ref(false)
  const missions = ref<MissionPrestataire[]>([])
  const mission = ref<Mission | null>(null)
  const messages = ref<Message[]>([])
  const notifications = ref<PrestataireNotification[]>([])
  const communicationRequests = ref<CommunicationRequestForPrestataire[]>([])
  const statistics = ref<PrestataireStatistics | null>(null)
  const availabilityStatus = ref<AvailabilityStatus>('available')

  const { client } = useApolloClient()




  async function getSiretInfo(siret: string) {
    try {
      const result = await fetchSiretInfo(siret)
      
      if (result.isValid && result.companyInfo) {
        companyInfo.value = result.companyInfo
        siretValidated.value = true
        showSuccess('Informations SIRET récupérées avec succès')
      } else {
        siretValidated.value = false
        throw new Error(result.error || 'Erreur lors de la validation SIRET')
      }
    } catch (error) {
      siretValidated.value = false
      handleError(error, 'SIRET Validation', { showToast: true })
      throw error
    }
  }

  async function prestataireSignup(
    companyInfoData: CompanyInfo,
    contactData: Contact,
    providerInfoData: ProviderInfo,
    accountData: Account
  ) {
    try {
      const { data } = await client.mutate({
        mutation: PRESTATAIRE_SIGNUP_MUTATION,
        variables: {
          input: {
            companyInfo: companyInfoData,
            contact: contactData,
            providerInfo: providerInfoData,
            account: accountData
          }
        }
      })
      const { token, expiresIn, refreshToken } = data.prestataireSignup
      localStorage.setItem('token', token)
      localStorage.setItem('expiresIn', expiresIn)
      localStorage.setItem('refreshToken', refreshToken)
      
      showSuccess('Inscription réussie ! Redirection vers votre dashboard...')
    } catch (error) {
      handleGraphQLError(error, 'Prestataire Signup', { showToast: true })
      throw error
    }
  }

  async function getMissions() {
    try {
      const { data } = await client.query({
        query: GET_PRESTATAIRE_MISSIONS_QUERY,
        fetchPolicy: 'network-only'
      })
      missions.value = data.getPrestataireMissions
    } catch (error) {
      handleGraphQLError(error, 'Fetch Missions', { showToast: true })
      throw error
    }
  }

  async function getMissionDetails(missionId: string) {
    try {
      const { data } = await client.query({
        query: GET_MISSION_DETAILS_QUERY,
        variables: { missionId },
        fetchPolicy: 'network-only'
      })
      mission.value = data.mission
    } catch (error) {
      handleGraphQLError(error, 'Fetch Mission Details', { showToast: true })
      throw error
    }
  }

  async function updateMissionStatus(missionId: string, status: MissionStatutPrestataire) {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_MISSION_STATUS_MUTATION,
        variables: {
          missionId,
          status
        }
      })
      
      // Refresh missions from server to ensure consistency
      await getMissions()
      
      showSuccess('Statut de la mission mis à jour avec succès')
    } catch (error) {
      handleGraphQLError(error, 'Update Mission Status', { showToast: true })
      throw error
    }
  }

  async function sendMessage(missionId: string, content: string) {
    try {
      const { data } = await client.mutate({
        mutation: SEND_COMMENT_MUTATION,
        variables: {
          missionId,
          content
        }
      })
      messages.value.push(data.sendComment)
    } catch (error) {
      handleGraphQLError(error, 'Send Message', { showToast: true })
      throw error
    }
  }

  async function sendFile(missionId: string, file: File, comment: string) {
    try {
      await client.mutate({
        mutation: SEND_FILE,
        variables: {
          missionId,
          file,
          comment,
        }
      })
      showSuccess('Fichier envoyé avec succès')
    } catch (error) {
      handleGraphQLError(error, 'Send File', { showToast: true })
      throw error
    }
  }

  async function fetchMessages(missionId: string) {
    try {
      const { data } = await client.query({
        query: GET_MESSAGES_QUERY,
        variables: { missionId }
      });
      
      if (data?.getMessages) {
        messages.value = data.getMessages;
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  function subscribeToNewMessages(missionId: string) {
    // Fetch messages using GraphQL
    fetchMessages(missionId);
    
    // Setup subscription for real-time updates
    try {
      client
        .subscribe({
          query: ON_NEW_MESSAGE_SUBSCRIPTION,
          variables: { missionId }
        })
        .subscribe({
          next({ data }) {
            messages.value.push(data.onNewMessage)
          },
          error(err) {
            console.warn('Message subscription failed:', err)
          }
        })
    } catch (error) {
      console.warn('Failed to start message subscription:', error)
    }
  }

  // Notifications management
  async function fetchNotifications() {
    try {
      const { data } = await client.query({
        query: GET_PRESTATAIRE_NOTIFICATIONS_QUERY,
        fetchPolicy: 'network-only'
      })
      notifications.value = data.getPrestataireNotifications
    } catch (error) {
      handleGraphQLError(error, 'Fetch Notifications', { showToast: true })
      throw error
    }
  }

  async function markNotificationAsRead(notificationId: string) {
    try {
      await client.mutate({
        mutation: MARK_PRESTATAIRE_NOTIFICATION_READ_MUTATION,
        variables: { notificationId }
      })
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (error) {
      handleGraphQLError(error, 'Mark Notification Read', { showToast: true })
      throw error
    }
  }

  // Communication requests management
  async function fetchCommunicationRequests() {
    try {
      const { data } = await client.query({
        query: GET_COMMUNICATION_REQUESTS_FOR_PRESTATAIRE_QUERY,
        fetchPolicy: 'network-only'
      })
      communicationRequests.value = data.getCommunicationRequestsForPrestataire
    } catch (error) {
      handleGraphQLError(error, 'Fetch Communication Requests', { showToast: true })
      throw error
    }
  }

  async function respondToCommunicationRequest(input: CommunicationResponseInput) {
    try {
      await client.mutate({
        mutation: RESPOND_TO_COMMUNICATION_REQUEST_MUTATION,
        variables: { input }
      })
      // Refresh communication requests
      await fetchCommunicationRequests()
      showSuccess('Réponse envoyée avec succès')
    } catch (error) {
      handleGraphQLError(error, 'Respond to Communication Request', { showToast: true })
      throw error
    }
  }

  // Statistics
  async function fetchStatistics() {
    try {
      const { data } = await client.query({
        query: GET_PRESTATAIRE_STATISTICS_QUERY,
        fetchPolicy: 'network-only'
      })
      statistics.value = data.getPrestataireStatistics
    } catch (error) {
      handleGraphQLError(error, 'Fetch Statistics', { showToast: true })
      throw error
    }
  }

  // Export functionality
  async function exportMissions(filters: PrestataireExportFilters, format: ExportFormat = 'pdf') {
    try {
      const { data } = await client.query({
        query: EXPORT_PRESTATAIRE_MISSIONS_QUERY,
        variables: { filters, format },
        fetchPolicy: 'network-only'
      })
      
      if (data?.exportPrestataireMissions) {
        const { url, filename } = data.exportPrestataireMissions
        // Download the file
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        showSuccess('Export généré avec succès')
        return data.exportPrestataireMissions
      }
    } catch (error) {
      handleGraphQLError(error, 'Export Missions', { showToast: true })
      throw error
    }
  }

  async function exportReport(period: ReportPeriod, format: ExportFormat = 'pdf') {
    try {
      const { data } = await client.query({
        query: EXPORT_PRESTATAIRE_REPORT_QUERY,
        variables: { period, format },
        fetchPolicy: 'network-only'
      })
      
      if (data?.exportPrestataireReport) {
        const { url, filename } = data.exportPrestataireReport
        // Download the file
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        showSuccess('Rapport généré avec succès')
        return data.exportPrestataireReport
      }
    } catch (error) {
      handleGraphQLError(error, 'Export Report', { showToast: true })
      throw error
    }
  }

  // Profile management
  async function updateProfile(input: PrestataireProfileUpdateInput) {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_PRESTATAIRE_PROFILE_MUTATION,
        variables: { input }
      })
      showSuccess('Profil mis à jour avec succès')
      return data.updatePrestataireProfile
    } catch (error) {
      handleGraphQLError(error, 'Update Profile', { showToast: true })
      throw error
    }
  }

  async function updateAvailability(status: AvailabilityStatus) {
    try {
      await client.mutate({
        mutation: UPDATE_PRESTATAIRE_AVAILABILITY_MUTATION,
        variables: { status }
      })
      availabilityStatus.value = status
      showSuccess('Statut de disponibilité mis à jour')
    } catch (error) {
      handleGraphQLError(error, 'Update Availability', { showToast: true })
      throw error
    }
  }

  // Enhanced file upload
  async function sendFileWithMessage(input: FileMessageInput) {
    try {
      const { data } = await client.mutate({
        mutation: SEND_FILE_WITH_MESSAGE_MUTATION,
        variables: { input }
      })
      messages.value.push(data.sendFileWithMessage)
      showSuccess('Fichier envoyé avec succès')
    } catch (error) {
      handleGraphQLError(error, 'Send File with Message', { showToast: true })
      throw error
    }
  }

  async function uploadMissionDocument(input: MissionDocumentInput) {
    try {
      const { data } = await client.mutate({
        mutation: UPLOAD_MISSION_DOCUMENT_MUTATION,
        variables: { input }
      })
      showSuccess('Document uploadé avec succès')
      return data.uploadMissionDocument
    } catch (error) {
      handleGraphQLError(error, 'Upload Mission Document', { showToast: true })
      throw error
    }
  }

  // Real-time subscriptions
  function subscribeToNotifications() {
    try {
      client
        .subscribe({
          query: ON_PRESTATAIRE_NOTIFICATION_SUBSCRIPTION
        })
        .subscribe({
          next({ data }) {
            notifications.value.unshift(data.onPrestataireNotification)
          },
          error(err) {
            console.warn('Notification subscription failed:', err)
          }
        })
    } catch (error) {
      console.warn('Failed to start notification subscription:', error)
    }
  }

  function subscribeToNewMissions() {
    try {
      client
        .subscribe({
          query: ON_NEW_MISSION_ASSIGNMENT_SUBSCRIPTION
        })
        .subscribe({
          next({ data }) {
            missions.value.unshift(data.onNewMissionAssignment)
            // Optionally show a notification
            showSuccess('Nouvelle mission reçue !')
          },
          error(err) {
            console.warn('Mission assignment subscription failed:', err)
          }
        })
    } catch (error) {
      console.warn('Failed to start mission assignment subscription:', error)
    }
  }

  function subscribeToCommunicationRequests() {
    try {
      client
        .subscribe({
          query: ON_COMMUNICATION_REQUEST_SUBSCRIPTION
        })
        .subscribe({
          next({ data }) {
            communicationRequests.value.unshift(data.onCommunicationRequest)
            showSuccess('Nouvelle demande de communication reçue')
          },
          error(err) {
            console.warn('Communication request subscription failed:', err)
          }
        })
    } catch (error) {
      console.warn('Failed to start communication request subscription:', error)
    }
  }

  return {
    companyInfo,
    contact,
    providerInfo,
    email,
    password,
    siretValidated,
    missions,
    mission,
    messages,
    notifications,
    communicationRequests,
    statistics,
    availabilityStatus,
    getSiretInfo,
    prestataireSignup,
    getMissions,
    getMissionDetails,
    updateMissionStatus,
    sendMessage,
    sendFile,
    fetchMessages,
    subscribeToNewMessages,
    fetchNotifications,
    markNotificationAsRead,
    fetchCommunicationRequests,
    respondToCommunicationRequest,
    fetchStatistics,
    exportMissions,
    exportReport,
    updateProfile,
    updateAvailability,
    sendFileWithMessage,
    uploadMissionDocument,
    subscribeToNotifications,
    subscribeToNewMissions,
    subscribeToCommunicationRequests
  }
})
