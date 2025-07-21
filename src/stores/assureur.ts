import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CompanyInfo } from '@/interfaces/company-info';
import type { FiltresDeRecherche } from '@/interfaces/filtres-de-recherche';
import { SEARCH_PRESTATAIRES_QUERY } from '@/graphql/queries/search-prestataires';
import { GET_ASSUREUR_MISSIONS_QUERY } from '@/graphql/queries/get-assureur-missions';
import { GET_MISSION_DETAILS_QUERY } from '@/graphql/queries/get-mission-details';
import { CREATE_MISSION_MUTATION } from '@/graphql/mutations/create-mission';
import { UPDATE_MISSION_STATUS_MUTATION } from '@/graphql/mutations/update-mission-status';
import { 
  SUSPEND_MISSION_MUTATION,
  RESUME_MISSION_MUTATION,
  VALIDATE_MISSION_COMPLETION_MUTATION,
  CANCEL_MISSION_MUTATION,
  RATE_PRESTATAIRE_MUTATION
} from '@/graphql/mutations/mission-lifecycle';
import {
  GET_MISSION_DOCUMENTS_QUERY,
  GET_DOCUMENT_DOWNLOAD_URL_QUERY
} from '@/graphql/queries/mission-documents';
import { GET_NOTIFICATIONS_QUERY, MARK_NOTIFICATION_READ_MUTATION, type Notification } from '@/graphql/queries/get-notifications';
import { EXPORT_MISSIONS_QUERY, EXPORT_MISSION_DETAILS_QUERY, type ExportFilters, type ExportFormat } from '@/graphql/queries/export-missions';
import { ON_NOTIFICATION_SUBSCRIPTION, } from '@/graphql/subscriptions/on-notification';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@vue/apollo-composable';
import type { Prestataire } from '@/interfaces/prestataire';
import type { Mission } from '@/interfaces/mission';
import type { MissionDetails } from '@/interfaces/MissionDetails';
import { useAuthStore } from '@/stores/auth';

// Import new utilities
import { fetchSiretInfo } from '@/utils/siret';
import { handleError, handleGraphQLError, showSuccess } from '@/utils/error-handling';
import { DEFAULT_VALUES } from '@/constants';
import { GET_ASSUREUR_MISSIONS_ENHANCED_QUERY } from '@/graphql/queries/get-assureur-missions-enhanced';

export const useAssureurStore = defineStore('assureur', () => {
  const { client } = useApolloClient();
  const authStore = useAuthStore();
  
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
  const missions = ref<MissionDetails[]>([]);
  const mission = ref<MissionDetails | null>(null);
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
    const { onResult, onError } = useQuery(SEARCH_PRESTATAIRES_QUERY, { input: filters });

    onResult((queryResult) => {
      if (queryResult.data) {
        prestataires.value = queryResult.data.searchPrestataires.map((p: any) => ({
          ...p,
          nom: p.contactPerson,
          raisonSociale: p.companyName,
          ville: p.address.city,
          telephone: p.phone,
          adresse: `${p.address.street}, ${p.address.postalCode} ${p.address.city}`,
          notemoyenne: p.rating,
          secteurs: [],
          nombreAvis: 0,
          siret: '',
          formeJuridique: '',
          dateCreation: '',
          description: '',
          certifications: [],
          documentsPublics: [],
          departement: '',
          region: ''
        }));
      }
    });

    onError((error) => {
      console.error('Error searching prestataires:', error);
      handleGraphQLError(error, 'Search Prestataires', { showToast: true });
    });
  };

  const fetchMissions = async () => {
          if (!authStore.user?.id) {
        console.warn('No authenticated user found, cannot fetch missions');
        return;
      }

      const { onResult, onError } = useQuery(GET_ASSUREUR_MISSIONS_ENHANCED_QUERY)

      onResult((queryResult) => {
        console.log('🔍 GraphQL missions query result:', queryResult);
        if(queryResult.data && queryResult.data.getAssureurMissionsEnhanced) {
          const missionsData = queryResult.data.getAssureurMissionsEnhanced;
          console.log('✅ Missions data received:', missionsData);
          console.log('📊 Number of missions:', missionsData.length);
          if (missionsData.length > 0) {
            console.log('📋 First mission sample:', missionsData[0]);
            console.log('📋 Mission fields:', Object.keys(missionsData[0]));
          } else {
            console.log('📭 Missions array is empty');
          }
          missions.value = missionsData;
        } else {
          console.log('❌ No missions data in response');
        }
      })

      onError((error) => {
        console.error('❌ GraphQL Error fetching missions:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        handleGraphQLError(error, 'Fetch Missions', { showToast: true });
      })
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
  const { mutate: markNotificationRead } = useMutation(MARK_NOTIFICATION_READ_MUTATION);




  // Notifications management
  const fetchNotifications = () => {
    const { onResult, onError } = useQuery(GET_NOTIFICATIONS_QUERY, null, { fetchPolicy: 'network-only' });

    onResult((queryResult) => {
      if (queryResult.data) {
        notifications.value = queryResult.data.getUserNotifications;
      }
    });

    onError((error) => {
      console.error('Error fetching notifications:', error);
      handleGraphQLError(error, 'Get Notifications', { showToast: true });
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead({ notificationId });
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (error) {
      handleGraphQLError(error, 'Mark Notification Read', { showToast: true });
      throw error;
    }
  };

  // Export functionality
  const exportMissions = (filters: ExportFilters, format: ExportFormat = 'pdf') => {
    const { onResult, onError } = useQuery(EXPORT_MISSIONS_QUERY, { filters, format }, { fetchPolicy: 'network-only' });

    onResult((queryResult) => {
      if (queryResult.data?.exportMissions) {
        const { url, filename } = queryResult.data.exportMissions;
        // Download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Export généré avec succès');
      }
    });

    onError((error) => {
      console.error('Error exporting missions:', error);
      handleGraphQLError(error, 'Export Missions', { showToast: true });
    });
  };

  const exportMissionDetails = (missionId: string, format: ExportFormat = 'pdf') => {
    const { onResult, onError } = useQuery(EXPORT_MISSION_DETAILS_QUERY, { missionId, format }, { fetchPolicy: 'network-only' });

    onResult((queryResult) => {
      if (queryResult.data?.exportMissionDetails) {
        const { url, filename } = queryResult.data.exportMissionDetails;
        // Download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Export de la mission généré avec succès');
      }
    });

    onError((error) => {
      console.error('Error exporting mission details:', error);
      handleGraphQLError(error, 'Export Mission Details', { showToast: true });
    });
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


  // Assureur-specific mission lifecycle functions
  const { mutate: suspendMissionMutation } = useMutation(SUSPEND_MISSION_MUTATION);
  const { mutate: resumeMissionMutation } = useMutation(RESUME_MISSION_MUTATION);
  const { mutate: validateMissionCompletionMutation } = useMutation(VALIDATE_MISSION_COMPLETION_MUTATION);
  const { mutate: cancelMissionMutation } = useMutation(CANCEL_MISSION_MUTATION);
  const { mutate: ratePrestataireMutation } = useMutation(RATE_PRESTATAIRE_MUTATION);


  const suspendMission = async (missionId: string, suspensionReason: string, expectedResumeDate?: string) => {
    try {
      await suspendMissionMutation({
        input: {
          missionId,
          suspensionReason,
          expectedResumeDate
        }
      });
      
      await fetchMissions();
      showSuccess('Mission suspendue');
    } catch (error) {
      handleGraphQLError(error, 'Suspend Mission', { showToast: true });
      throw error;
    }
  };

  const resumeMission = async (missionId: string, resumeComment?: string) => {
    try {
      await resumeMissionMutation({
        input: {
          missionId,
          resumeComment
        }
      });
      
      await fetchMissions();
      showSuccess('Mission reprise');
    } catch (error) {
      handleGraphQLError(error, 'Resume Mission', { showToast: true });
      throw error;
    }
  };

  const validateMissionCompletion = async (missionId: string, validationComment?: string) => {
    try {
      await validateMissionCompletionMutation({
        missionId,
        validationComment
      });
      
      await fetchMissions();
      showSuccess('Mission validée');
    } catch (error) {
      handleGraphQLError(error, 'Validate Mission', { showToast: true });
      throw error;
    }
  };

  const cancelMission = async (missionId: string, cancellationReason: string) => {
    try {
      await cancelMissionMutation({
        input: {
          missionId,
          cancellationReason,
          cancelledBy: 'assureur'
        }
      });
      
      await fetchMissions();
      showSuccess('Mission annulée');
    } catch (error) {
      handleGraphQLError(error, 'Cancel Mission', { showToast: true });
      throw error;
    }
  };

  const ratePrestataire = async (missionId: string, rating: number, comment?: string) => {
    try {
      const result = await ratePrestataireMutation({
        input: {
          missionId,
          rating,
          comment
        }
      });
      
      if (result?.data?.ratePrestataire) {
        showSuccess('Prestataire évalué avec succès');
        return result.data.ratePrestataire;
      }
    } catch (error) {
      handleGraphQLError(error, 'Rate Prestataire', { showToast: true });
      throw error;
    }
  };


  return {
    siretValidated,
    companyInfo,
    prestataires,
    missions,
    mission,
    notifications,
    validateSiret,
    searchPrestataires,
    fetchMissions,
    getMissionDetails,
    createMission,
    updateMissionStatus,
    suspendMission,
    resumeMission,
    validateMissionCompletion,
    cancelMission,
    ratePrestataire,
    fetchNotifications,
    markAsRead,
    exportMissions,
    exportMissionDetails,
    subscribeToNotifications,
  };
});
