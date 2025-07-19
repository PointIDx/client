import { gql } from '@apollo/client/core'

export const SEND_COMMENT_MUTATION = gql`
  mutation SendComment($input: CommentInput!) {
    sendComment(input: $input) {
      id
      missionId
      userId
      expediteur
      contenu
      dateEnvoi
      lu
      createdAt
    }
  }
`

export const SEND_FILE_WITH_MESSAGE_MUTATION = gql`
  mutation SendFileWithMessage($input: FileMessageInput!) {
    sendFileWithMessage(input: $input) {
      id
      missionId
      expediteur
      contenu
      dateEnvoi
      lu
      fichiers {
        id
        filename
        url
        contentType
        size
        uploadDate
        description
        uploadedBy
      }
    }
  }
`