import { gql } from '@apollo/client/core'

export const DELETE_CHAT_MESSAGE = gql`
  mutation DeleteChatMessage($messageId: UUID!) {
    deleteChatMessage(messageId: $messageId)
  }
`