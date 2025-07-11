import { gql } from 'graphql-tag'

export const GET_PRESTATAIRE_MISSIONS_QUERY = gql`
  query GetPrestataireMissions {
    getPrestataireMissions {
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
    }
  }
`
