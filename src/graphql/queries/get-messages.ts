import { gql } from 'graphql-tag';

export const GET_MESSAGES_QUERY = gql`
  query GetMessages($missionId: String!) {
    getMessages(missionId: $missionId) {
      id
      missionId
      expediteur
      contenu
      dateEnvoi
      lu
      fichiers {
        id
        fileName
        url
        contentType
        size
      }
    }
  }
`;