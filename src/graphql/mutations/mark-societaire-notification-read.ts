import { gql } from 'graphql-tag';

export const MARK_SOCIETAIRE_NOTIFICATION_READ = gql`
  mutation MarkSocietaireNotificationRead($notificationId: ID!) {
    markSocietaireNotificationRead(notificationId: $notificationId) {
      id
      isRead
      readAt
    }
  }
`;