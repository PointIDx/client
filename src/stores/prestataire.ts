import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CompanyInfo } from '@/interfaces/company-info'
import type { Contact } from '@/interfaces/contact'
import type { ProviderInfo } from '@/interfaces/provider-info'
import type { Account } from '@/interfaces/account'
import { PRESTATAIRE_SIGNUP_MUTATION } from '@/graphql/mutations/prestataire-signup'
import { useApolloClient, useMutation, useQuery, useSubscription } from '@vue/apollo-composable'

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

  const { mutate: prestataireSignupMutation } = useMutation(PRESTATAIRE_SIGNUP_MUTATION);

  async function prestataireSignup(
    companyInfoData: CompanyInfo,
    contactData: Contact,
    providerInfoData: ProviderInfo,
    accountData: Account
  ) {
    try {
      const result = await prestataireSignupMutation({
        input: {
          companyInfo: {
            raisonSociale: companyInfoData.raisonSociale,
            siret: companyInfoData.siret,
            companyAddress: {
              street: companyInfoData.adresse,
              city: companyInfoData.ville,
              postalCode: companyInfoData.codePostal,
              country: companyInfoData.pays || 'France'
            },
            licenseNumber: null
          },
          contactInfo: {
            nom: contactData.nom,
            prenom: contactData.prenom,
            phone: contactData.telephone,
            email: contactData.email
          },
          accountInfo: {
            password: accountData.password
          },
          specializations: providerInfoData.secteursActivite?.split(',').map(s => s.trim()) || [],
          certifications: [],
          availabilityZones: providerInfoData.zonesGeographiques?.regions || []
        }
      });
      if (result && result.data) {
        const { tokens, user } = result.data.prestataireSignup;
        localStorage.setItem('token', tokens.token);
        localStorage.setItem('expiresIn', tokens.expiresIn.toString());
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        showSuccess('Inscription réussie ! Redirection vers votre dashboard...');
      }
    } catch (error) {
      handleGraphQLError(error, 'Prestataire Signup', { showToast: true });
      throw error;
    }
  }

  async function getMissions() {

    const { onResult, onError } = useQuery(GET_PRESTATAIRE_MISSIONS_QUERY)

    onResult((queryResult) => {
      if(queryResult.data) {
        missions.value = queryResult.data.getPrestataireMissions
      }
    })

    onError((err) => {
      handleGraphQLError(err, 'Fetch Missions', { showToast: true })
      throw err
    })
  }

  async function getMissionDetails(missionId: string) {
    const { onResult, onError } = useQuery(GET_MISSION_DETAILS_QUERY, { missionId }, { fetchPolicy: 'network-only' });

    onResult((queryResult) => {
      if (queryResult.data) {
        mission.value = queryResult.data.mission;
      }
    });

    onError((error) => {
      handleGraphQLError(error, 'Fetch Mission Details', { showToast: true });
      throw error;
    });
  }

  const { mutate: updateMissionStatusMutation } = useMutation(UPDATE_MISSION_STATUS_MUTATION);

  async function updateMissionStatus(missionId: string, status: MissionStatutPrestataire) {
    try {
      await updateMissionStatusMutation({ missionId, status });
      
      // Refresh missions from server to ensure consistency
      await getMissions();
      
      showSuccess('Statut de la mission mis à jour avec succès');
    } catch (error) {
      handleGraphQLError(error, 'Update Mission Status', { showToast: true });
      throw error;
    }
  }

  const { mutate: sendMessageMutation } = useMutation(SEND_COMMENT_MUTATION);

  async function sendMessage(missionId: string, content: string) {
    try {
      const result = await sendMessageMutation({ missionId, content });
      if (result && result.data) {
        messages.value.push(result.data.sendComment);
      }
    } catch (error) {
      handleGraphQLError(error, 'Send Message', { showToast: true });
      throw error;
    }
  }

  const { mutate: sendFileMutation } = useMutation(SEND_FILE);

  async function sendFile(missionId: string, file: File, comment: string) {
    try {
      await sendFileMutation({ missionId, file, comment });
      showSuccess('Fichier envoyé avec succès');
    } catch (error) {
      handleGraphQLError(error, 'Send File', { showToast: true });
      throw error;
    }
  }

  async function fetchMessages(missionId: string) {
    const { onResult, onError } = useQuery(GET_MESSAGES_QUERY, {missionId})
    onResult((queryResult) => {
      if(queryResult.data)  {
        messages.value = queryResult.data.getMessages;
      }
    })

    onError((err) => {
      throw err
    })
  }

  function subscribeToNewMessages(missionId: string) {
    // Fetch messages using GraphQL
    fetchMessages(missionId);
    
    // Setup subscription for real-time updates
    const { onResult, onError } = useSubscription(ON_NEW_MESSAGE_SUBSCRIPTION, { missionId });

    onResult((result) => {
      if (result.data) {
        messages.value.push(result.data.onNewMessage);
      }
    });

    onError((error) => {
      console.warn('Message subscription failed:', error);
    });
  }

  // Notifications management
  async function fetchNotifications() {
    const { onResult, onError } = useQuery(GET_PRESTATAIRE_NOTIFICATIONS_QUERY)

    onResult((queryResult) => {
      if(queryResult.data){
        notifications.value = queryResult.data.getPrestataireNotifications
      }
    })

    onError((err) => {
      handleGraphQLError(err, 'Fetch Notifications', { showToast: true })
      throw err
    })
  }

  const { mutate: markNotificationAsReadMutation } = useMutation(MARK_PRESTATAIRE_NOTIFICATION_READ_MUTATION);

  async function markNotificationAsRead(notificationId: string) {
    try {
      await markNotificationAsReadMutation({ notificationId });
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (error) {
      handleGraphQLError(error, 'Mark Notification Read', { showToast: true });
      throw error;
    }
  }

  // Communication requests management
  async function fetchCommunicationRequests() {

    const { onResult, onError } = useQuery(GET_COMMUNICATION_REQUESTS_FOR_PRESTATAIRE_QUERY)

    onResult((queryResult) => {
      if(queryResult.data){
        communicationRequests.value = queryResult.data.getCommunicationRequestsForPrestataire
      }
    })


    onError((err) => {
      handleGraphQLError(err, 'Fetch Communication Requests', { showToast: true })
      throw err
    })
  }

  const { mutate: respondToCommunicationRequestMutation } = useMutation(RESPOND_TO_COMMUNICATION_REQUEST_MUTATION);

  async function respondToCommunicationRequest(input: CommunicationResponseInput) {
    try {
      await respondToCommunicationRequestMutation({ input });
      // Refresh communication requests
      await fetchCommunicationRequests();
      showSuccess('Réponse envoyée avec succès');
    } catch (error) {
      handleGraphQLError(error, 'Respond to Communication Request', { showToast: true });
      throw error;
    }
  }

  // Statistics
  async function fetchStatistics() {
      const { onResult, onError } = useQuery(GET_PRESTATAIRE_STATISTICS_QUERY)

      onResult((QueryResult) => {
        if(QueryResult.data) {
          statistics.value = QueryResult.data.getPrestataireStatistics
        }
      })

      onError((err) => {
      handleGraphQLError(err, 'Fetch Statistics', { showToast: true })
      throw err
      })
  }

  // Export functionality
  async function exportMissions(filters: PrestataireExportFilters, format: ExportFormat = 'pdf') {
    const { onResult, onError } = useQuery(EXPORT_PRESTATAIRE_MISSIONS_QUERY, { filters, format }, { fetchPolicy: 'network-only' });

    onResult((queryResult) => {
      if (queryResult.data?.exportPrestataireMissions) {
        const { url, filename } = queryResult.data.exportPrestataireMissions;
        // Download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        showSuccess('Export généré avec succès');
      }
    });

    onError((error) => {
      handleGraphQLError(error, 'Export Missions', { showToast: true });
      throw error;
    });
  }

  async function exportReport(period: ReportPeriod, format: ExportFormat = 'pdf') {
    const { onResult, onError } = useQuery(EXPORT_PRESTATAIRE_REPORT_QUERY, { period, format }, { fetchPolicy: 'network-only' });

    onResult((queryResult) => {
      if (queryResult.data?.exportPrestataireReport) {
        const { url, filename } = queryResult.data.exportPrestataireReport;
        // Download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        showSuccess('Rapport généré avec succès');
      }
    });

    onError((error) => {
      handleGraphQLError(error, 'Export Report', { showToast: true });
      throw error;
    });
  }

  // Profile management
  const { mutate: updateProfileMutation } = useMutation(UPDATE_PRESTATAIRE_PROFILE_MUTATION);

  async function updateProfile(input: PrestataireProfileUpdateInput) {
    try {
      const result = await updateProfileMutation({ input });
      if (result && result.data) {
        showSuccess('Profil mis à jour avec succès');
        return result.data.updatePrestataireProfile;
      }
    } catch (error) {
      handleGraphQLError(error, 'Update Profile', { showToast: true });
      throw error;
    }
  }

  const { mutate: updateAvailabilityMutation } = useMutation(UPDATE_PRESTATAIRE_AVAILABILITY_MUTATION);

  async function updateAvailability(status: AvailabilityStatus) {
    try {
      await updateAvailabilityMutation({ status });
      availabilityStatus.value = status;
      showSuccess('Statut de disponibilité mis à jour');
    } catch (error) {
      handleGraphQLError(error, 'Update Availability', { showToast: true });
      throw error;
    }
  }

  // Enhanced file upload
  const { mutate: sendFileWithMessageMutation } = useMutation(SEND_FILE_WITH_MESSAGE_MUTATION);

  async function sendFileWithMessage(input: FileMessageInput) {
    try {
      const result = await sendFileWithMessageMutation({ input });
      if (result && result.data) {
        messages.value.push(result.data.sendFileWithMessage);
        showSuccess('Fichier envoyé avec succès');
      }
    } catch (error) {
      handleGraphQLError(error, 'Send File with Message', { showToast: true });
      throw error;
    }
  }

  const { mutate: uploadMissionDocumentMutation } = useMutation(UPLOAD_MISSION_DOCUMENT_MUTATION);

  async function uploadMissionDocument(input: MissionDocumentInput) {
    try {
      const result = await uploadMissionDocumentMutation({ input });
      if (result && result.data) {
        showSuccess('Document uploadé avec succès');
        return result.data.uploadMissionDocument;
      }
    } catch (error) {
      handleGraphQLError(error, 'Upload Mission Document', { showToast: true });
      throw error;
    }
  }

  // Real-time subscriptions
  function subscribeToNotifications() {
    const { onResult, onError } = useSubscription(ON_PRESTATAIRE_NOTIFICATION_SUBSCRIPTION);

    onResult((result) => {
      if (result.data) {
        notifications.value.unshift(result.data.onPrestataireNotification);
      }
    });

    onError((error) => {
      console.warn('Notification subscription failed:', error);
    });
  }

  function subscribeToNewMissions() {
    const { onResult, onError } = useSubscription(ON_NEW_MISSION_ASSIGNMENT_SUBSCRIPTION);

    onResult((result) => {
      if (result.data) {
        missions.value.unshift(result.data.onNewMissionAssignment);
        // Optionally show a notification
        showSuccess('Nouvelle mission reçue !');
      }
    });

    onError((error) => {
      console.warn('Mission assignment subscription failed:', error);
    });
  }

  function subscribeToCommunicationRequests() {
    const { onResult, onError } = useSubscription(ON_COMMUNICATION_REQUEST_SUBSCRIPTION);

    onResult((result) => {
      if (result.data) {
        communicationRequests.value.unshift(result.data.onCommunicationRequest);
        showSuccess('Nouvelle demande de communication reçue');
      }
    });

    onError((error) => {
      console.warn('Communication request subscription failed:', error);
    });
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
