import { gql } from 'graphql-tag';

export const GET_PRESTATAIRE_MISSIONS_ENHANCED_QUERY = gql`
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
        userId
      }
      dateCreation
    }
  }
`;