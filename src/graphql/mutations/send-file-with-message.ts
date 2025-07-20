import { gql } from '@apollo/client/core'

export const SEND_FILE_WITH_MESSAGE_MUTATION = gql`
  mutation SendFileWithMessage($input: FileMessageInput!) {
    sendFileWithMessage(input: $input) {
      id
      missionId
      expediteur
      contenu
      dateEnvoi
      fichiers {
        id
        fileName
        url
        contentType
        size
      }
      lu
    }
  }
`

