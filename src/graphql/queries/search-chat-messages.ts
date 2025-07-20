import { gql } from '@apollo/client/core'

export const SEARCH_CHAT_MESSAGES = gql`
  query SearchChatMessages($query: String!, $roomId: UUID, $limit: Int) {
    searchChatMessages(query: $query, roomId: $roomId, limit: $limit) {
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