import { gql } from 'graphql-tag';

export const CREATE_NOTIFICATION_MUTATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
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