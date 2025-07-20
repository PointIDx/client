import { gql } from '@apollo/client/core'

export const GET_OR_CREATE_DIRECT_ROOM = gql`
  query GetOrCreateDirectRoom($otherUserId: UUID!) {
    getOrCreateDirectRoom(otherUserId: $otherUserId) {
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