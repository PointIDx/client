import type { Prestataire } from './prestataire';
import { MissionStatut } from '@/enums/mission-statut';
import { Urgence } from '@/enums/urgence';

export interface Mission {
  id: string
  prestataire: Prestataire
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
    urgence: Urgence
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
  statut: MissionStatut
  dateCreation: string
  numeroMission: string
}
