import { gql } from 'graphql-tag'

export const PRESTATAIRE_SIGNUP_MUTATION = gql`
  mutation PrestataireSignup($input: PrestataireSignupInput!) {
    prestataireSignup(input: $input) {
      token
      expiresIn
      refresh_token
    }
  }
`
