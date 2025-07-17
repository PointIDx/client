import { gql } from 'graphql-tag';

export const ON_ASSUREUR_MISSION_UPDATE = gql`
  subscription OnAssureurMissionUpdate($assureurId: UUID!) {
    onAssureurMissionUpdate(assureurId: $assureurId) {
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