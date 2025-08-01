
import { gql } from 'graphql-tag'

export const CREATE_MISSION_MUTATION = gql`
  mutation CreateMission($input: MissionCreateInput!) {
    createMission(input: $input) {
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
