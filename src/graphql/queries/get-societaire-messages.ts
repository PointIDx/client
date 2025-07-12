import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_MESSAGES = gql`
  query GetSocietaireMessages($dossierNumber: String!, $offset: Int = 0, $limit: Int = 50) {
    getSocietaireMessages(dossierNumber: $dossierNumber, offset: $offset, limit: $limit) {
      messages {
        id
        dossierNumber
        expediteur
        destinataire
        contenu
        dateEnvoi
        lu
        type
        fichiers {
          id
          fileName
          url
          contentType
          size
        }
        metadata {
          key
          value
        }
      }
      totalCount
      hasMore
    }
  }
`;