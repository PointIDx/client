import { gql } from '@apollo/client/core'

export const MARK_ROOM_MESSAGES_AS_READ = gql`
  mutation MarkRoomMessagesAsRead($roomId: UUID!) {
    markRoomMessagesAsRead(roomId: $roomId)
  }
`