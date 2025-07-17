import { gql } from '@apollo/client/core'

export const GET_PRESTATAIRE_NOTIFICATIONS_QUERY = gql`
  query GetPrestataireNotifications {
    getPrestataireNotifications {
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

export const MARK_PRESTATAIRE_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkPrestataireNotificationRead($notificationId: String!) {
    markPrestataireNotificationRead(notificationId: $notificationId) {
      id
      read
    }
  }
`

export interface PrestataireNotification {
  id: string
  userId: string
  notificationType: 'new_mission' | 'mission_updated' | 'communication_request' | 'payment_received' | 'review_received'
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