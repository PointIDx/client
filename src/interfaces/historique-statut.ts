import { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire';

export interface HistoriqueStatut {
  id: string
  missionId: string
  ancienStatut: MissionStatutPrestataire;
  nouveauStatut: MissionStatutPrestataire;
  commentaire?: string
  dateChangement: string
}
