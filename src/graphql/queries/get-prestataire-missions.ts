import { gql } from 'graphql-tag'

export const GET_PRESTATAIRE_MISSIONS_QUERY = gql`
  query GetPrestataireMissionsEnhanced {
    getPrestataireMissionsEnhanced {
      id
      missionStatus
      dossier
      assureur {
        id
        companyName
        contactPerson
        phone
        email
      }
      dateCreation
    }
  }
`
