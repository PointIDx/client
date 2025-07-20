import { gql } from '@apollo/client/core'

export const CREATE_CHAT_ROOM = gql`
  mutation CreateChatRoom($input: CreateChatRoomInput!) {
    createChatRoom(input: $input) {
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