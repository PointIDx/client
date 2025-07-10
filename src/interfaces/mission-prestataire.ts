import type { UrgenceMission } from '@/enums/urgence-mission';
import type { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire';

export interface Mission {
  id: string
  numeroMission: string
  assureur: {
    nom: string
    email: string
    telephone: string
  }
  client: {
    civilite: string
    nom: string
    prenom: string
    telephone: string
    email: string
  }
  chantier: {
    adresse: string
    ville: string
    codePostal: string
  }
  mission: {
    titre: string
    description: string
    budgetEstime: string
  }
  sinistre: {
    type: string
    urgence: UrgenceMission;
    numeroSinistre: string
  }
  statut: MissionStatutPrestataire;
  dateCreation: string
  dateReponse?: string
  dateFinPrevue?: string
  nouveauxMessages: number
}
