import type { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire';

export interface MissionPrestataire {
  id: string
  missionStatus: MissionStatutPrestataire
  dossier: {
    id: string
    dossierNumber: string
    description: string
    address: string
    type: string
  }
  assureur: {
    id: string
    companyName: string
  }
  dateCreation: string
  dateReponse?: string
  dateFinPrevue?: string
  nouveauxMessages: number
}
