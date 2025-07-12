import { gql } from 'graphql-tag';

export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
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
