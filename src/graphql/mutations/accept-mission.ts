import { gql } from 'graphql-tag';

export const ACCEPT_MISSION_MUTATION = gql`
  mutation AcceptMission($missionId: UUID!) {
    acceptMission(missionId: $missionId) {
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
`;