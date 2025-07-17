import { gql } from 'graphql-tag';

export const ASSUREUR_SIGNUP_MUTATION = gql`
  mutation AssureurSignup($input: AssureurSignupInput!) {
    assureurSignup(input: $input) {
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