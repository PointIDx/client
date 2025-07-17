import { gql } from 'graphql-tag';

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      tokens {
        token
        refreshToken
        expiresIn
      }
      user {
        id
        email
        accountType
        createdAt
        updatedAt
        emailVerified
        isActive
        profile
      }
    }
  }
`;
