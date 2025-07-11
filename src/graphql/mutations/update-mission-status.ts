import { gql } from 'graphql-tag'

export const UPDATE_MISSION_STATUS_MUTATION = gql`
  mutation UpdateMissionStatus($missionId: ID!, $status: MissionStatusPrestataire!) {
    updateMissionStatus(missionId: $missionId, status: $status) {
      id
      missionStatus
    }
  }
`
