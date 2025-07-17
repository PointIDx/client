import { gql } from 'graphql-tag';

export const GET_NOTIFICATION_STATS_QUERY = gql`
  query GetNotificationStats {
    getNotificationStats {
      total
      unread
      criticalUnread
      highUnread
    }
  }
`;