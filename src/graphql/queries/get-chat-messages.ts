import { gql } from '@apollo/client/core'

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($roomId: UUID!, $limit: Int, $offset: Int) {
    getChatMessages(roomId: $roomId, limit: $limit, offset: $offset) {
      id
      roomId
      senderId
      content
      messageType
      sentAt
      editedAt
      replyToId
      replyToMessage {
        id
        content
        senderName
      }
      fileAttachments
      isRead
      senderName
      senderAvatar
    }
  }
`