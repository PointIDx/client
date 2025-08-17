import { gql } from '@apollo/client/core'

export const GET_SUB_MISSION_COMMENTS_QUERY = gql`
  query GetSubMissionComments($subMissionId: UUID!) {
    getSubMissionComments(subMissionId: $subMissionId) {
      id
      userId
      expediteur
      contenu
      dateEnvoi
      createdAt
      lu
    }
  }
`