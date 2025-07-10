import type { PrestataireAssureur } from './prestataire-assureur';
import { UrgenceSinistre } from '@/enums/urgence-sinistre';
import { MissionStatutAssureur } from '@/enums/mission-statut-assureur';

export interface MissionAssureur {
  id: string
  prestataire: PrestataireAssureur
  client: {
    civilite: string
    nom: string
    prenom: string
    telephone: string
    email: string
    adresse: string
    codePostal: string
    ville: string
  }
  chantier: {
    adresse: string
    codePostal: string
    ville: string
    typeAcces: string
    etage: string
    contraintes: string
  }
  sinistre: {
    type: string
    description: string
    urgence: UrgenceSinistre
    dateSinistre: string
    dateIntervention: string
  }
  mission: {
    titre: string
    description: string
    budgetEstime: string
    delaiSouhaite: string
    horaires: string
    materiaux: string
    normes: string
  }
  documents: File[]
  statut: MissionStatutAssureur
  dateCreation: string
  numeroMission: string
}
