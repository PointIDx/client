import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CompanyInfo } from '@/interfaces/company-info';
import type { FiltresDeRecherche } from '@/interfaces/filtres-de-recherche';
import { SEARCH_PRESTATAIRES_QUERY } from '@/graphql/queries/search-prestataires';
import { GET_NOTIFICATIONS_QUERY, MARK_NOTIFICATION_READ_MUTATION, type Notification } from '@/graphql/queries/get-notifications';
import { ON_NOTIFICATION_SUBSCRIPTION, } from '@/graphql/subscriptions/on-notification';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@vue/apollo-composable';
import type { Prestataire } from '@/interfaces/prestataire';
import { useAuthStore } from '@/stores/auth';

// Import new utilities
import { fetchSiretInfo } from '@/utils/siret';
import { handleError, handleGraphQLError, showSuccess } from '@/utils/error-handling';
import { DEFAULT_VALUES } from '@/constants';

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
          secteurs: p.specialties || [],
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

  // Notifications management
  const { mutate: markNotificationRead } = useMutation(MARK_NOTIFICATION_READ_MUTATION);
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



  return {
    siretValidated,
    companyInfo,
    prestataires,
    notifications,
    validateSiret,
    searchPrestataires,
    fetchNotifications,
    markAsRead,
    subscribeToNotifications,
  };
});
