import { gql } from '@apollo/client/core'

export const ON_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotification {
    onNotification {
      id
      type
      title
      message
      date
      read
      data
    }
  }
`

export const ON_COMMUNICATION_RESPONSE_SUBSCRIPTION = gql`
  subscription OnCommunicationResponse {
    onCommunicationResponse {
      id
      prestataire {
        id
        nom
        raisonSociale
      }
      statut
      dateReponse
      reponseMessage
    }
  }
`