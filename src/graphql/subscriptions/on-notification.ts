import { gql } from '@apollo/client/core'

export const ON_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotification {
    onNotification {
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