import { gql } from '@apollo/client/core'

export const CHAT_ROOM_EVENTS = gql`
  subscription ChatRoomEvents($roomId: UUID!) {
    chatRoomEvents(roomId: $roomId) {
      type
      roomId
      data
    }
  }
`