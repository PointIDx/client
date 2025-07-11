import { gql } from 'graphql-tag';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      tokens {
        token
        refreshToken
        expiresIn
      }
      user {
        id
        email
        type
        profile
      }
    }
  }
`;
