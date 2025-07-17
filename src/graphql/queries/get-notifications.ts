import { gql } from '@apollo/client/core'

export const GET_NOTIFICATIONS_QUERY = gql`
  query GetUserNotifications($unreadOnly: Boolean, $notificationType: String, $limit: Int, $offset: Int) {
    getUserNotifications(unreadOnly: $unreadOnly, notificationType: $notificationType, limit: $limit, offset: $offset) {
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
`

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($notificationId: UUID!) {
    markNotificationRead(notificationId: $notificationId)
  }
`

export interface Notification {
  id: string
  userId: string
  notificationType: string
  title: string
  message: string
  relatedEntityId?: string
  relatedEntityType?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isRead: boolean
  createdAt: string
  expiresAt?: string
  actionUrl?: string
  metadata: Array<{
    key: string
    value: string
  }>
}