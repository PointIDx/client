import { gql } from 'graphql-tag';

export const SEND_COMMENT = gql`
  mutation SendComment($dossierNumber: String!, $comment: String!) {
    sendComment(dossierNumber: $dossierNumber, comment: $comment) {
      success
      message
      historiqueItem {
        auteur
        message
        date
        type
        fichiers
      }
    }
  }
`;
