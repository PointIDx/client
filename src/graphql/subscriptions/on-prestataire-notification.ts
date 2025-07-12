import { gql } from '@apollo/client/core'

export const ON_PRESTATAIRE_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnPrestataireNotification {
    onPrestataireNotification {
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

export const ON_NEW_MISSION_ASSIGNMENT_SUBSCRIPTION = gql`
  subscription OnNewMissionAssignment {
    onNewMissionAssignment {
      id
      missionStatus
      dossier {
        id
        dossierNumber
        description
        address
        type
      }
      assureur {
        id
        companyName
      }
      dateCreation
    }
  }
`

export const ON_COMMUNICATION_REQUEST_SUBSCRIPTION = gql`
  subscription OnCommunicationRequest {
    onCommunicationRequest {
      id
      assureur {
        id
        companyName
        email
      }
      message
      dateEnvoi
    }
  }
`