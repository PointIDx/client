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
import type { Message } from '@/interfaces/message'

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
      // Update the mission in the local store
      const updatedMission = data.updateMissionStatus
      const index = missions.value.findIndex((m) => m.id === updatedMission.id)
      if (index !== -1) {
        missions.value[index].missionStatus = updatedMission.missionStatus
      }
      
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

  function subscribeToNewMessages(missionId: string) {
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
          handleError(err, 'Message Subscription', { showToast: false })
        }
      })
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
    getSiretInfo,
    prestataireSignup,
    getMissions,
    getMissionDetails,
    updateMissionStatus,
    sendMessage,
    sendFile,
    subscribeToNewMessages
  }
})
