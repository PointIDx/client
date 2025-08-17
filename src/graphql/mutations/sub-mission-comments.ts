import { gql } from '@apollo/client/core'

export const ADD_SUB_MISSION_COMMENT_MUTATION = gql`
  mutation AddSubMissionComment($subMissionId: UUID!, $contenu: String!) {
    addSubMissionComment(input: {
      subMissionId: $subMissionId
      contenu: $contenu
    }) {
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