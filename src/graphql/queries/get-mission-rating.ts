import { gql } from '@apollo/client/core'

export const GET_MISSION_RATING_QUERY = gql`
  query GetMissionRating($missionId: UUID!) {
    getMissionRating(missionId: $missionId) {
      id
      missionId
      rating
      comment
      createdAt
    }
  }
`