import { gql } from '@apollo/client/core'

export const GET_CHAT_ROOM = gql`
  query GetChatRoom($roomId: UUID!) {
    getChatRoom(roomId: $roomId) {
      id
      roomType
      participants
      name
      description
      avatarUrl
      createdBy
      createdAt
      updatedAt
      lastMessageId
      lastMessageAt
      isArchived
      unreadCount
    }
  }
`