import { gql } from '@apollo/client/core'

export const MARK_MESSAGE_AS_READ = gql`
  mutation MarkMessageAsRead($input: MarkMessageAsReadInput!) {
    markMessageAsRead(input: $input)
  }
`