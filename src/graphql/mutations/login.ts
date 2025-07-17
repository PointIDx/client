import { gql } from 'graphql-tag';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      tokens {
        token
        refreshToken
        expiresIn
      }
      user {
        id
        email
        passwordHash
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
