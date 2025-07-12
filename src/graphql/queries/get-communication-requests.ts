import { gql } from '@apollo/client/core'

export const GET_COMMUNICATION_REQUESTS_QUERY = gql`
  query GetCommunicationRequests {
    getCommunicationRequests {
      id
      prestataire {
        id
        nom
        raisonSociale
        ville
        telephone
        email
      }
      message
      statut
      dateEnvoi
      dateReponse
      reponseMessage
    }
  }
`

export interface CommunicationRequestResponse {
  id: string
  prestataire: {
    id: string
    nom: string
    raisonSociale: string
    ville: string
    telephone: string
    email: string
  }
  message: string
  statut: 'en_attente' | 'acceptee' | 'refusee'
  dateEnvoi: string
  dateReponse?: string
  reponseMessage?: string
}