import { gql } from 'graphql-tag'

export const GET_PRESTATAIRE_MISSIONS_QUERY = gql`
  query GetPrestataireMissions {
    getPrestataireMissions {
      id
      reference
      title
      description
      statut
      urgence
      assureurId
      prestataireId
      societaireDossier
      createdAt
      updatedAt
      deadline
      location {
        street
        city
        postalCode
        country
      }
      estimatedCost
      actualCost
    }
  }
`
