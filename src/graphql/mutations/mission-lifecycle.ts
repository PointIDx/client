import { gql } from '@apollo/client/core'

export const ACCEPT_MISSION_ENHANCED_MUTATION = gql`
  mutation AcceptMissionEnhanced($input: AcceptMissionInput!) {
    acceptMissionEnhanced(input: $input) {
      id
      reference
      statut
      updatedAt
    }
  }
`

export const REFUSE_MISSION_MUTATION = gql`
  mutation RefuseMission($input: RefuseMissionInput!) {
    refuseMission(input: $input) {
      id
      reference
      statut
      updatedAt
    }
  }
`

export const START_MISSION_MUTATION = gql`
  mutation StartMission($input: StartMissionInput!) {
    startMission(input: $input) {
      id
      reference
      statut
      updatedAt
    }
  }
`

export const COMPLETE_MISSION_MUTATION = gql`
  mutation CompleteMission($input: CompleteMissionInput!) {
    completeMission(input: $input) {
      id
      reference
      statut
      actualCost
      updatedAt
    }
  }
`

export const CANCEL_MISSION_MUTATION = gql`
  mutation CancelMission($input: CancelMissionInput!) {
    cancelMission(input: $input) {
      id
      reference
      statut
      updatedAt
    }
  }
`

export const SUSPEND_MISSION_MUTATION = gql`
  mutation SuspendMission($input: SuspendMissionInput!) {
    suspendMission(input: $input) {
      id
      reference
      statut
      updatedAt
    }
  }
`

export const RESUME_MISSION_MUTATION = gql`
  mutation ResumeMission($input: ResumeMissionInput!) {
    resumeMission(input: $input) {
      id
      reference
      statut
      updatedAt
    }
  }
`

export const VALIDATE_MISSION_COMPLETION_MUTATION = gql`
  mutation ValidateMissionCompletion($missionId: UUID!, $validationComment: String) {
    validateMissionCompletion(missionId: $missionId, validationComment: $validationComment) {
      id
      reference
      statut
      updatedAt
    }
  }
`

export const RATE_PRESTATAIRE_MUTATION = gql`
  mutation RatePrestataire($input: RatePrestaireInput!) {
    ratePrestataire(input: $input) {
      id
      subMissionId
      rating
      comment
      createdAt
    }
  }
`