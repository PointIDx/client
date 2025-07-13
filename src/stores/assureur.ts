import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CompanyInfo } from '@/interfaces/company-info';
import type { FiltresDeRecherche } from '@/interfaces/filtres-de-recherche';
import { SEARCH_PRESTATAIRES_QUERY } from '@/graphql/queries/search-prestataires';
import { GET_ASSUREUR_MISSIONS_QUERY } from '@/graphql/queries/get-assureur-missions';
import { GET_MISSION_DETAILS_QUERY } from '@/graphql/queries/get-mission-details';
import { CREATE_MISSION_MUTATION } from '@/graphql/mutations/create-mission';
import { UPDATE_MISSION_STATUS_MUTATION } from '@/graphql/mutations/update-mission-status';
import { SEND_COMMUNICATION_REQUEST_MUTATION, type CommunicationRequestInput } from '@/graphql/mutations/send-communication-request';
import { GET_COMMUNICATION_REQUESTS_QUERY, type CommunicationRequestResponse } from '@/graphql/queries/get-communication-requests';
import { GET_NOTIFICATIONS_QUERY, MARK_NOTIFICATION_READ_MUTATION, type Notification } from '@/graphql/queries/get-notifications';
import { EXPORT_MISSIONS_QUERY, EXPORT_MISSION_DETAILS_QUERY, type ExportFilters, type ExportFormat } from '@/graphql/queries/export-missions';
import { ON_NOTIFICATION_SUBSCRIPTION, ON_COMMUNICATION_RESPONSE_SUBSCRIPTION } from '@/graphql/subscriptions/on-notification';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@vue/apollo-composable';
import type { Prestataire } from '@/interfaces/prestataire';
import type { Mission } from '@/interfaces/mission';

// Import new utilities
import { fetchSiretInfo } from '@/utils/siret';
import { handleError, handleGraphQLError, showSuccess } from '@/utils/error-handling';
import { DEFAULT_VALUES } from '@/constants';

export const useAssureurStore = defineStore('assureur', () => {
  const { client } = useApolloClient();
  
  const siretValidated = ref(false);
  const companyInfo = ref<CompanyInfo>({
    raisonSociale: '',
    siret: '',
    formeJuridique: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: DEFAULT_VALUES.COUNTRY,
    dateCreation: '',
  });

  const prestataires = ref<Prestataire[]>([]);
  const missions = ref<Mission[]>([]);
  const mission = ref<Mission | null>(null);
  const communicationRequests = ref<CommunicationRequestResponse[]>([]);
  const notifications = ref<Notification[]>([]);

  const validateSiret = async (siret: string) => {
    try {
      const result = await fetchSiretInfo(siret);
      
      if (result.isValid && result.companyInfo) {
        // Update the company info with the validated data
        companyInfo.value = { ...companyInfo.value, ...result.companyInfo };
        siretValidated.value = true;
        showSuccess('SIRET validé avec succès');
        return true;
      } else {
        siretValidated.value = false;
        throw new Error(result.error || 'Erreur lors de la validation SIRET');
      }
    } catch (error) {
      siretValidated.value = false;
      handleError(error, 'SIRET Validation', { showToast: true });
      throw error;
    }
  };

  const searchPrestataires = (filters: FiltresDeRecherche) => {
    const { onResult, onError } = useQuery(SEARCH_PRESTATAIRES_QUERY, filters);

    onResult((queryResult) => {
      if (queryResult.data) {
        prestataires.value = queryResult.data.searchPrestataires;
      }
    });

    onError((error) => {
      console.error('Error searching prestataires:', error);
      handleGraphQLError(error, 'Search Prestataires', { showToast: true });
    });
  };

  const fetchMissions = async () => {
    try {
      const result = await client.query({
        query: GET_ASSUREUR_MISSIONS_QUERY,
        fetchPolicy: 'network-only'
      });
      
      if (result?.data?.missions) {
        missions.value = result.data.missions;
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
      handleGraphQLError(error, 'Fetch Missions', { showToast: true });
    }
  };

  const getMissionDetails = (missionId: string) => {
    const { onResult, onError } = useQuery(GET_MISSION_DETAILS_QUERY, { missionId });

    onResult((queryResult) => {
      if (queryResult.data) {
        mission.value = queryResult.data.mission;
      }
    });

    onError((error) => {
      console.error('Error fetching mission details:', error);
      throw new Error('Erreur lors de la récupération des détails de la mission.');
    });
  };

  const { mutate: createMission } = useMutation(CREATE_MISSION_MUTATION);
  const { mutate: updateMissionStatus } = useMutation(UPDATE_MISSION_STATUS_MUTATION);
  const { mutate: sendCommunicationRequest } = useMutation(SEND_COMMUNICATION_REQUEST_MUTATION);
  const { mutate: markNotificationRead } = useMutation(MARK_NOTIFICATION_READ_MUTATION);

  // Communication requests management
  const fetchCommunicationRequests = async () => {
    try {
      const result = await client.query({
        query: GET_COMMUNICATION_REQUESTS_QUERY,
        fetchPolicy: 'network-only'
      });
      
      if (result?.data?.getCommunicationRequests) {
        communicationRequests.value = result.data.getCommunicationRequests;
      }
    } catch (error) {
      console.error('Error fetching communication requests:', error);
      handleGraphQLError(error, 'Get Communication Requests', { showToast: true });
    }
  };

  const sendCommRequest = async (input: CommunicationRequestInput) => {
    try {
      const result = await sendCommunicationRequest({ input });
      if (result?.data?.sendCommunicationRequest) {
        // Refresh communication requests
        fetchCommunicationRequests();
        showSuccess('Demande de communication envoyée avec succès');
        return result.data.sendCommunicationRequest;
      }
    } catch (error) {
      handleGraphQLError(error, 'Send Communication Request', { showToast: true });
      throw error;
    }
  };

  // Notifications management
  const fetchNotifications = async () => {
    try {
      const result = await client.query({
        query: GET_NOTIFICATIONS_QUERY,
        fetchPolicy: 'network-only'
      });
      
      if (result?.data?.getNotifications) {
        notifications.value = result.data.getNotifications;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      handleGraphQLError(error, 'Get Notifications', { showToast: true });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead({ notificationId });
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    } catch (error) {
      handleGraphQLError(error, 'Mark Notification Read', { showToast: true });
      throw error;
    }
  };

  // Export functionality
  const exportMissions = async (filters: ExportFilters, format: ExportFormat = 'pdf') => {
    try {
      const result = await client.query({
        query: EXPORT_MISSIONS_QUERY,
        variables: { filters, format },
        fetchPolicy: 'network-only'
      });
      
      if (result?.data?.exportMissions) {
        const { url, filename } = result.data.exportMissions;
        // Download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Export généré avec succès');
        return result.data.exportMissions;
      }
    } catch (error) {
      console.error('Error exporting missions:', error);
      handleGraphQLError(error, 'Export Missions', { showToast: true });
      throw error;
    }
  };

  const exportMissionDetails = async (missionId: string, format: ExportFormat = 'pdf') => {
    try {
      const result = await client.query({
        query: EXPORT_MISSION_DETAILS_QUERY,
        variables: { missionId, format },
        fetchPolicy: 'network-only'
      });
      
      if (result?.data?.exportMissionDetails) {
        const { url, filename } = result.data.exportMissionDetails;
        // Download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Export de la mission généré avec succès');
        return result.data.exportMissionDetails;
      }
    } catch (error) {
      console.error('Error exporting mission details:', error);
      handleGraphQLError(error, 'Export Mission Details', { showToast: true });
      throw error;
    }
  };

  // Real-time subscriptions
  const subscribeToNotifications = () => {
    const { onResult, onError } = useSubscription(ON_NOTIFICATION_SUBSCRIPTION);

    onResult((result) => {
      if (result.data?.onNotification) {
        notifications.value.unshift(result.data.onNotification);
      }
    });

    onError((error) => {
      console.error('Error in notification subscription:', error);
    });
  };

  const subscribeToCommunicationResponses = () => {
    const { onResult, onError } = useSubscription(ON_COMMUNICATION_RESPONSE_SUBSCRIPTION);

    onResult((result) => {
      if (result.data?.onCommunicationResponse) {
        // Refresh communication requests to get updated status
        fetchCommunicationRequests();
      }
    });

    onError((error) => {
      console.error('Error in communication response subscription:', error);
    });
  };

  return {
    siretValidated,
    companyInfo,
    prestataires,
    missions,
    mission,
    communicationRequests,
    notifications,
    validateSiret,
    searchPrestataires,
    fetchMissions,
    getMissionDetails,
    createMission,
    updateMissionStatus,
    fetchCommunicationRequests,
    sendCommRequest,
    fetchNotifications,
    markAsRead,
    exportMissions,
    exportMissionDetails,
    subscribeToNotifications,
    subscribeToCommunicationResponses,
  };
});
