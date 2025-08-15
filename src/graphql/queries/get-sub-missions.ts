import { gql } from 'graphql-tag';

export const GET_SUB_MISSIONS_BY_MISSION = gql`
  query GetSubMissionsByMission($missionId: UUID!) {
    getSubMissionsByMission(missionId: $missionId) {
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

export const GET_SUB_MISSION_DETAILS = gql`
  query GetSubMission($subMissionId: UUID!) {
    getSubMission(subMissionId: $subMissionId) {
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

export const GET_PRESTATAIRE_SUB_MISSIONS = gql`
  query GetPrestataireSubMissions($prestataireId: UUID) {
    getPrestataireSubMissions(prestataireId: $prestataireId) {
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

export const GET_AVAILABLE_SUB_MISSIONS = gql`
  query GetAvailableSubMissions($specialization: String) {
    getAvailableSubMissions(specialization: $specialization) {
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