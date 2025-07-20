import { gql } from '@apollo/client/core'

export const CHAT_EVENTS = gql`
  subscription ChatEvents($roomIds: [UUID!]!) {
    chatEvents(roomIds: $roomIds) {
      eventType
      roomId
      userId
      data
    }
  }
`