import { gql } from 'graphql-tag';

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      token
      refreshToken
      expiresIn
    }
  }
`;