import { gql } from 'graphql-tag';

export const ON_SOCIETAIRE_TIMELINE_UPDATE = gql`
  subscription OnSocietaireTimelineUpdate($dossierNumber: String!) {
    onSocietaireTimelineUpdate(dossierNumber: $dossierNumber) {
      id
      dossierNumber
      timeline {
        id
        date
        status
        description
        updatedBy
        comment
        attachments {
          id
          fileName
          url
        }
      }
      updatedBy
      updatedAt
    }
  }
`;