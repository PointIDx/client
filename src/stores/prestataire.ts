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
import { SEND_FILE_MUTATION } from '@/graphql/mutations/send-file'
import { ON_NEW_MESSAGE_SUBSCRIPTION } from '@/graphql/subscriptions/on-new-message'
import type { Message } from '@/interfaces/message'

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
      // This should be a call to our backend, which then calls the INSEE API
      const response = await fetch(`/api/siret/${siret}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch SIRET information')
      }
      const data = await response.json()
      const { uniteLegale, adresseEtablissement, dateCreationEtablissement } = data.etablissement
      companyInfo.value = {
        siret,
        raisonSociale: uniteLegale.denominationUniteLegale,
        formeJuridique: uniteLegale.categorieJuridiqueUniteLegale,
        adresse: `${adresseEtablissement.numeroVoieEtablissement} ${adresseEtablissement.typeVoieEtablissement} ${adresseEtablissement.libelleVoieEtablissement}`,
        codePostal: adresseEtablissement.codePostalEtablissement,
        ville: adresseEtablissement.libelleCommuneEtablissement,
        dateCreation: dateCreationEtablissement
      }
      siretValidated.value = true
    } catch (error) {
      console.error(error)
      siretValidated.value = false
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
      // Potentially set user in auth store here
    } catch (error) {
      console.error('Error during prestataire signup:', error)
      throw new Error('Failed to sign up prestataire')
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
      console.error('Error fetching prestataire missions:', error)
      throw new Error('Failed to fetch missions')
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
      console.error('Error fetching mission details:', error)
      throw new Error('Failed to fetch mission details')
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
    } catch (error) {
      console.error('Error updating mission status:', error)
      throw new Error('Failed to update mission status')
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
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }

  async function sendFile(missionId: string, file: File, comment: string) {
    try {
      const { data } = await client.mutate({
        mutation: SEND_FILE_MUTATION,
        variables: {
          missionId,
          file,
          comment,
        }
      })
      // Handle the response, maybe update the mission's documents
    } catch (error) {
      console.error('Error sending file:', error)
      throw new Error('Failed to send file')
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
          console.error('Error in message subscription:', err)
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
