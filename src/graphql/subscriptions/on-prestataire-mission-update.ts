import { gql } from 'graphql-tag';

export const ON_PRESTATAIRE_MISSION_UPDATE = gql`
  subscription OnPrestataireMissionUpdate($prestataireId: UUID) {
    onPrestataireMissionUpdate(prestataireId: $prestataireId) {
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