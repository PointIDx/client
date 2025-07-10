import { gql } from 'graphql-tag';

export const SOCIETAIRE_LOGIN = gql`
  mutation SocietaireLogin($email: String!, $dossierNumber: String!) {
    societaireLogin(email: $email, dossierNumber: $dossierNumber) {
      token
      societaire {
        email
        dossierNumber
      }
    }
  }
`;
