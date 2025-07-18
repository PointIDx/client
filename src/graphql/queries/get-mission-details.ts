
import { gql } from 'graphql-tag'

export const GET_MISSION_DETAILS_QUERY = gql`
  query GetMissionDetails($missionId: UUID!) {
    getMissionDetails(missionId: $missionId) {
      id
      reference
      status
      dateDeCreation
      urgence
      description
      societaire {
        id
        dossierNumber
        firstName
        lastName
        phone
        email
      }
      prestataire {
        id
        companyName
        contactPerson
        phone
        email
      }
      documents {
        id
        filename
        url
        contentType
        size
        uploadDate
        description
        uploadedBy
      }
      historique {
        id
        entityType
        entityId
        action
        oldValue
        newValue
        userId
        timestamp
        ipAddress
        userAgent
      }
      commentaires {
        id
        missionId
        userId
        expediteur
        contenu
        dateEnvoi
        lu
        createdAt
      }
      estimatedCost
      actualCost
      location {
        street
        city
        postalCode
        country
      }
      deadline
    }
  }
`
