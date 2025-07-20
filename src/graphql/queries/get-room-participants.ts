import { gql } from '@apollo/client/core'

export const GET_ROOM_PARTICIPANTS = gql`
  query GetRoomParticipants($roomId: UUID!) {
    getRoomParticipants(roomId: $roomId) {
      id
      roomId
      userId
      role
      joinedAt
      lastSeenAt
      isMuted
      userName
      userAvatar
    }
  }
`