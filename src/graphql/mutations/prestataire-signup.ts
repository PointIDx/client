import { gql } from 'graphql-tag'

export const PRESTATAIRE_SIGNUP_MUTATION = gql`
  mutation PrestataireSignup($input: PrestataireSignupInput!) {
    prestataireSignup(input: $input) {
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
`
