import { gql } from 'graphql-tag';

export const ON_SOCIETAIRE_NOTIFICATION = gql`
  subscription OnSocietaireNotification($dossierNumber: String!) {
    onSocietaireNotification(dossierNumber: $dossierNumber) {
      id
      userId
      notificationType
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