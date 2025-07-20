import { gql } from '@apollo/client/core'

export const SET_TYPING_INDICATOR = gql`
  mutation SetTypingIndicator($input: SetTypingIndicatorInput!) {
    setTypingIndicator(input: $input)
  }
`