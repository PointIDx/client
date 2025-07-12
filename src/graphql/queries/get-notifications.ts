import { gql } from '@apollo/client/core'

export const GET_NOTIFICATIONS_QUERY = gql`
  query GetNotifications {
    getNotifications {
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

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      read
    }
  }
`

export interface Notification {
  id: string
  type: 'mission_created' | 'mission_accepted' | 'mission_rejected' | 'new_message' | 'communication_response'
  title: string
  message: string
  date: string
  read: boolean
  data?: any
}