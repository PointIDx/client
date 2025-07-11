import { gql } from 'graphql-tag';

export const SEND_FILE = gql`
  mutation SendFile($missionId: ID!, $file: Upload!, $comment: String) {
    sendFile(missionId: $missionId, file: $file, comment: $comment) {
      success
      message
      document {
        id
        fileName
        url
      }
    }
  }
`;
