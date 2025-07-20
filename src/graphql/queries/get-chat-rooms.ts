import { gql } from '@apollo/client/core'

export const GET_CHAT_ROOMS = gql`
  query GetChatRooms {
    getChatRooms {
      room {
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
      }
      lastMessage {
        id
        content
        messageType
        sentAt
        senderName
        senderAvatar
      }
      unreadCount
    }
  }
`