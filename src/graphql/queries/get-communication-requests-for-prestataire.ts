import { gql } from '@apollo/client/core'

export const GET_COMMUNICATION_REQUESTS_FOR_PRESTATAIRE_QUERY = gql`
  query GetCommunicationRequestsForPrestataire {
    getCommunicationRequestsForPrestataire {
      id
      assureur {
        id
        companyName
        email
        phone
      }
      message
      statut
      dateEnvoi
      dateReponse
      reponseMessage
    }
  }
`

export const RESPOND_TO_COMMUNICATION_REQUEST_MUTATION = gql`
  mutation RespondToCommunicationRequest($input: CommunicationResponseInput!) {
    respondToCommunicationRequest(input: $input) {
      id
      statut
      dateReponse
      reponseMessage
    }
  }
`

export interface CommunicationRequestForPrestataire {
  id: string
  assureur: {
    id: string
    companyName: string
    email: string
    phone: string
  }
  message: string
  statut: 'en_attente' | 'acceptee' | 'refusee'
  dateEnvoi: string
  dateReponse?: string
  reponseMessage?: string
}

export interface CommunicationResponseInput {
  requestId: string
  statut: 'acceptee' | 'refusee'
  reponseMessage: string
}