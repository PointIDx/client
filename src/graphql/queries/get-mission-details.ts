
import { gql } from 'graphql-tag'

export const GET_MISSION_DETAILS_QUERY = gql`
  query GetMissionDetails($missionId: ID!) {
    mission(id: $missionId) {
      id
      reference
      status
      dateDeCreation
      urgence
      description
      societaire {
        id
        name
        address
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
        fileName
        url
      }
      historique {
        id
        date
        user
        action
      }
      commentaires {
        id
        text
        author
        date
      }
    }
  }
`
