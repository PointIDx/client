import { gql } from 'graphql-tag';

export const SEND_SOCIETAIRE_MESSAGE = gql`
  mutation SendSocietaireMessage($input: SocietaireMessageInput!) {
    sendSocietaireMessage(input: $input) {
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
  }
`;