import { gql } from '@apollo/client/core'

export const GET_OR_CREATE_DIRECT_ROOM = gql`
  query GetOrCreateDirectRoom($otherUserId: String!) {
    getOrCreateDirectRoom(otherUserId: $otherUserId) {
      id
      roomType
      participants
      name
      description
      createdBy
      createdAt
      updatedAt
      unreadCount
    }
  }
`