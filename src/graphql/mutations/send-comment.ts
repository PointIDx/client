import { gql } from 'graphql-tag';

export const SEND_COMMENT_MUTATION = gql`
  mutation SendComment($missionId: ID!, $content: String!) {
    sendComment(missionId: $missionId, content: $content) {
      id
      missionId
      expediteur
      contenu
      dateEnvoi
      lu
    }
  }
`;
