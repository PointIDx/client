import { gql } from '@apollo/client/core'

export const GET_PRESTATAIRE_NOTIFICATIONS_QUERY = gql`
  query GetPrestataireNotifications {
    getPrestataireNotifications {
      id
      type
      title
      message
      date
      read
      data
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
  type: 'new_mission' | 'mission_updated' | 'communication_request' | 'payment_received' | 'review_received'
  title: string
  message: string
  date: string
  read: boolean
  data?: any
}