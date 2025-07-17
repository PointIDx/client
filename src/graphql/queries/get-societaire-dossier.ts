import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_DOSSIER_QUERY = gql`
  query GetSocietaireDossier($dossierNumber: String!) {
    getSocietaireDossier(dossierNumber: $dossierNumber) {
      dossierData {
        dossierNumber
        status
        creationDate
        lastUpdate
        description
      }
      timeline {
        date
        status
        description
      }
      historique {
        date
        type
        description
      }
      documents {
        id
        name
        type
        url
        createdAt
      }
    }
  }
`;
