import { gql } from 'graphql-tag';

export const SEND_FILE = gql`
  mutation SendFile($dossierNumber: String!, $file: Upload!, $comment: String) {
    sendFile(dossierNumber: $dossierNumber, file: $file, comment: $comment) {
      success
      message
      document {
        nom
        type
        taille
        auteur
        date
      }
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
