// Interface that matches the GraphQL MissionAssignment type from the schema
export interface MissionPrestataire {
  id: string
  missionStatus: string // Uses MissionStatut from GraphQL schema: EN_ATTENTE, ASSIGNEE, EN_COURS, TERMINEE, ANNULEE, SUSPENDUE
  dossier: string
  assureur: {
    id: string
    companyName: string
    contactPerson: string
    phone: string
    email: string
    userId: string
  }
  dateCreation: string
}
