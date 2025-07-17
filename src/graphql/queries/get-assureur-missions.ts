
import { gql } from 'graphql-tag'

export const GET_ASSUREUR_MISSIONS_QUERY = gql`
  query GetAssureurMissions($assureurId: UUID!) {
    getAssureurMissions(assureurId: $assureurId) {
      id
      reference
      assureurId
      prestataireId
      societaireDossier
      title
      description
      urgence
      statut
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
