export interface SubMission {
  id: string
  missionId: string
  prestataireId?: string
  reference: string
  title: string
  description: string
  specialization: string
  urgence: UrgenceLevel
  statut: MissionStatut
  createdAt: string
  updatedAt: string
  deadline?: string
  estimatedCost?: number
  actualCost?: number
  materialsNeeded?: string
  specialRequirements?: string
  accessRequirements?: string
  estimatedDurationHours?: number
  dependsOnSubMissionId?: string
}

export interface SubMissionDetails extends SubMission {
  dependsOnSubMission?: SubMission
  prestataire?: {
    id: string
    companyName: string
    contactPerson: string
    phone: string
    email: string
  }
  parentMissionReference: string
}

export interface SubMissionCreateInput {
  missionId: string
  title: string
  description: string
  specialization: string
  urgence: UrgenceLevel
  deadline?: string
  estimatedCost?: number
  materialsNeeded?: string
  specialRequirements?: string
  accessRequirements?: string
  estimatedDurationHours?: number
  dependsOnSubMissionId?: string
}

export interface SubMissionAssignInput {
  subMissionId: string
  prestataireId: string
}

export interface SubMissionUpdateInput {
  subMissionId: string
  title?: string
  description?: string
  deadline?: string
  estimatedCost?: number
  actualCost?: number
  materialsNeeded?: string
  specialRequirements?: string
  accessRequirements?: string
  estimatedDurationHours?: number
}

export interface SubMissionStatusUpdateInput {
  subMissionId: string
  statut: MissionStatut
  comment?: string
}

export enum UrgenceLevel {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE', 
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE'
}

export enum MissionStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  INVITE = 'INVITE',
  ASSIGNEE = 'ASSIGNEE', 
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
  SUSPENDUE = 'SUSPENDUE'
}

export const SPECIALIZATIONS = [
  'Plomberie',
  'Électricité',
  'Peinture',
  'Carrelage',
  'Menuiserie',
  'Maçonnerie',
  'Chauffage',
  'Climatisation',
  'Isolation',
  'Couverture',
  'Serrurerie',
  'Vitrerie',
  'Nettoyage',
  'Débarras',
  'Autres'
] as const

export type Specialization = typeof SPECIALIZATIONS[number]