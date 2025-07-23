import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CompanyInfo } from '@/interfaces/company-info'
import type { Contact } from '@/interfaces/contact'
import type { ProviderInfo } from '@/interfaces/provider-info'
import type { Account } from '@/interfaces/account'
import { PRESTATAIRE_SIGNUP_MUTATION } from '@/graphql/mutations/prestataire-signup'
import { useApolloClient, useMutation, useQuery, useSubscription } from '@vue/apollo-composable'

import { SEND_COMMENT_MUTATION } from '@/graphql/mutations/send-comment'
import { SEND_FILE } from '@/graphql/mutations/send-file'
import { ON_NEW_MESSAGE_SUBSCRIPTION } from '@/graphql/subscriptions/on-new-message'
import { GET_MESSAGES_QUERY } from '@/graphql/queries/get-messages'

// Import new GraphQL operations
import { GET_PRESTATAIRE_NOTIFICATIONS_QUERY, MARK_PRESTATAIRE_NOTIFICATION_READ_MUTATION, type PrestataireNotification } from '@/graphql/queries/get-prestataire-notifications'
import { UPDATE_PRESTATAIRE_PROFILE_MUTATION, UPDATE_PRESTATAIRE_AVAILABILITY_MUTATION, type PrestataireProfileUpdateInput, type AvailabilityStatus } from '@/graphql/mutations/update-prestataire-profile'
import { ON_PRESTATAIRE_NOTIFICATION_SUBSCRIPTION, ON_NEW_MISSION_ASSIGNMENT_SUBSCRIPTION, ON_COMMUNICATION_REQUEST_SUBSCRIPTION } from '@/graphql/subscriptions/on-prestataire-notification'

// Import new utilities
import { fetchSiretInfo } from '@/utils/siret'
import { handleError, handleGraphQLError, showSuccess } from '@/utils/error-handling'
import { useAuthStore } from '@/stores/auth'
import { AuthUtils } from '@/utils/auth'

export const usePrestataireStore = defineStore('prestataire', () => {
  const companyInfo = ref<CompanyInfo | null>(null)
  const contact = ref<Contact | null>(null)
  const providerInfo = ref<ProviderInfo | null>(null)
  const email = ref('')
  const password = ref('')
  const siretValidated = ref(false)
  const notifications = ref<PrestataireNotification[]>([])
  const availabilityStatus = ref<AvailabilityStatus>('available')

  const { client } = useApolloClient()
  const authStore = useAuthStore()




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
        
        // Clean up any old token format from previous implementation
        localStorage.removeItem('token');
        localStorage.removeItem('expiresIn');
        localStorage.removeItem('refreshToken');
        
        // Use AuthUtils to properly save tokens and user data
        AuthUtils.saveTokens(tokens);
        AuthUtils.saveUser(user);
        
        // Reinitialize auth store to pick up the new tokens
        await authStore.initAuth();
        
        showSuccess('Inscription réussie ! Redirection vers votre dashboard...');
      }
    } catch (error) {
      handleGraphQLError(error, 'Prestataire Signup', { showToast: true });
      throw error;
    }
  }


  const { mutate: sendMessageMutation } = useMutation(SEND_COMMENT_MUTATION);

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
        // Optionally show a notification
        showSuccess('Nouvelle mission reçue !');
      }
    });

    onError((error) => {
      console.warn('Mission assignment subscription failed:', error);
    });
  }



  return {
    companyInfo,
    contact,
    providerInfo,
    email,
    password,
    siretValidated,
    notifications,
    availabilityStatus,
    getSiretInfo,
    prestataireSignup,
    sendFile,
    fetchNotifications,
    markNotificationAsRead,
    updateProfile,
    updateAvailability,
    subscribeToNotifications,
    subscribeToNewMissions,
  }
})
