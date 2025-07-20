import { gql } from '@apollo/client/core'

export const NEW_MESSAGES = gql`
  subscription NewMessages {
    newMessages {
      id
      roomId
      senderId
      content
      messageType
      sentAt
      editedAt
      replyToId
      fileAttachments
      isRead
      senderName
      senderAvatar
    }
  }
`