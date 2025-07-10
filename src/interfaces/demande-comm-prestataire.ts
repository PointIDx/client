import { DemandeCommStatut } from '@/enums/demande-comm-statut';

export interface DemandeCommPrestataire {
  id: string
  assureur: {
    nom: string
    entreprise: string
    email: string
    telephone: string
  }
  message: string
  statut: DemandeCommStatut
  dateEnvoi: string
  dateReponse?: string
}
