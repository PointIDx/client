import { gql } from '@apollo/client/core'

export const SEND_COMMUNICATION_REQUEST_MUTATION = gql`
  mutation SendCommunicationRequest($input: CommunicationRequestInput!) {
    sendCommunicationRequest(input: $input) {
      id
      prestataireId
      message
      statut
      dateEnvoi
      dateReponse
      reponseMessage
    }
  }
`

export interface CommunicationRequestInput {
  prestataireId: string
  message: string
}

export interface CommunicationRequest {
  id: string
  prestataireId: string
  message: string
  statut: 'en_attente' | 'acceptee' | 'refusee'
  dateEnvoi: string
  dateReponse?: string
  reponseMessage?: string
}