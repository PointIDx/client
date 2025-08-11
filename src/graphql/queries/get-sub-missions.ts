import { gql } from '@apollo/client/core'

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
  query GetSubMissionDetails($subMissionId: UUID!) {
    getSubMissionDetails(subMissionId: $subMissionId) {
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
      actualCost
      materialsNeeded
      specialRequirements
      accessRequirements
      estimatedDurationHours
      dependsOnSubMission {
        id
        reference
        title
        specialization
        statut
      }
      prestataire {
        id
        companyName
        contactPerson
        phone
        email
      }
      parentMissionReference
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