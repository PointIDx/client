import { gql } from 'graphql-tag';

export const SOCIETAIRE_LOGIN_MUTATION = gql`
  mutation SocietaireLogin($input: SocietaireLoginInput!) {
    societaireLogin(input: $input) {
      token
      societaire {
        email
        dossierNumber
      }
    }
  }
`;
