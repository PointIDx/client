import { gql } from 'graphql-tag';

export const GET_NOTIFICATION_STATS = gql`
  query GetNotificationStats {
    getNotificationStats {
      total
      unread
      criticalUnread
      highUnread
    }
  }
`;