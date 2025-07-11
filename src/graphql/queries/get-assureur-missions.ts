
import { gql } from 'graphql-tag'

export const GET_ASSUREUR_MISSIONS_QUERY = gql`
  query GetAssureurMissions {
    missions {
      id
      reference
      status
      societaire {
        id
        name
        address
      }
      prestataire {
        id
        companyName
      }
      dateDeCreation
    }
  }
`
