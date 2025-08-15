import { gql } from 'graphql-tag'

export const CREATE_SUB_MISSION = gql`
  mutation CreateSubMission($input: SubMissionCreateInput!) {
    createSubMission(input: $input) {
      id
      missionId
      reference
      title
      description
      specialization
      urgence
      statut
      createdAt
      updatedAt
      deadline
      estimatedCost
      materialsNeeded
      specialRequirements
      accessRequirements
      estimatedDurationHours
      dependsOnSubMissionId
    }
  }
`

export const ASSIGN_SUB_MISSION = gql`
  mutation AssignSubMission($input: SubMissionAssignInput!) {
    assignSubMission(input: $input) {
      id
      missionId
      prestataireId
      reference
      title
      description
      specialization
      urgence
      statut
      createdAt
      updatedAt
      deadline
      estimatedCost
      actualCost
      materialsNeeded
      specialRequirements
      accessRequirements
      estimatedDurationHours
      dependsOnSubMissionId
    }
  }
`

export const UPDATE_SUB_MISSION = gql`
  mutation UpdateSubMission($input: SubMissionUpdateInput!) {
    updateSubMission(input: $input) {
      id
      missionId
      prestataireId
      reference
      title
      description
      specialization
      urgence
      statut
      createdAt
      updatedAt
      deadline
      estimatedCost
      actualCost
      materialsNeeded
      specialRequirements
      accessRequirements
      estimatedDurationHours
      dependsOnSubMissionId
    }
  }
`

export const UPDATE_SUB_MISSION_STATUS = gql`
  mutation UpdateSubMissionStatus($input: SubMissionStatusUpdateInput!) {
    updateSubMissionStatus(input: $input) {
      id
      missionId
      prestataireId
      reference
      title
      description
      specialization
      urgence
      statut
      createdAt
      updatedAt
      deadline
      estimatedCost
      actualCost
      materialsNeeded
      specialRequirements
      accessRequirements
      estimatedDurationHours
      dependsOnSubMissionId
    }
  }
`

export const ACCEPT_SUB_MISSION = gql`
  mutation AcceptSubMission($subMissionId: UUID!) {
    acceptSubMission(subMissionId: $subMissionId) {
      id
      missionId
      prestataireId
      reference
      title
      description
      specialization
      urgence
      statut
      createdAt
      updatedAt
      deadline
      estimatedCost
      actualCost
      materialsNeeded
      specialRequirements
      accessRequirements
      estimatedDurationHours
      dependsOnSubMissionId
    }
  }
`