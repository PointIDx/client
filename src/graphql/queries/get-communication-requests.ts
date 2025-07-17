import { gql } from '@apollo/client/core'

export const GET_COMMUNICATION_REQUESTS_QUERY = gql`
  query GetCommunicationRequests {
    getCommunicationRequests {
      id
      senderId
      receiverId
      subject
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
  senderId: string
  receiverId: string
  subject: string
  message: string
  statut: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  dateEnvoi: string
  dateReponse?: string
  reponseMessage?: string
}