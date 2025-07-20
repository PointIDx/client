import { gql } from '@apollo/client/core'

export const EDIT_CHAT_MESSAGE = gql`
  mutation EditChatMessage($input: EditChatMessageInput!) {
    editChatMessage(input: $input) {
      id
      roomId
      senderId
      content
      messageType
      sentAt
      editedAt
      replyToId
      fileAttachments
      isRead
      senderName
      senderAvatar
    }
  }
`