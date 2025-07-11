
import { gql } from 'graphql-tag'

export const CREATE_MISSION_MUTATION = gql`
  mutation CreateMission($input: CreateMissionInput!) {
    createMission(input: $input) {
      id
      reference
      status
      dateDeCreation
    }
  }
`
