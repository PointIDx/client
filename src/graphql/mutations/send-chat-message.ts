import { gql } from '@apollo/client/core'

export const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage($input: SendChatMessageInput!) {
    sendChatMessage(input: $input) {
      id
      roomId
      senderId
      content
      messageType
      sentAt
      isRead
      fileAttachments
    }
  }
`