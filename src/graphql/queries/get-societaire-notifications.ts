import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_NOTIFICATIONS = gql`
  query GetSocietaireNotifications($dossierNumber: String!) {
    getSocietaireNotifications(dossierNumber: $dossierNumber) {
      id
      type
      title
      message
      relatedEntityId
      relatedEntityType
      priority
      isRead
      createdAt
      expiresAt
      actionUrl
      metadata {
        key
        value
      }
    }
  }
`;