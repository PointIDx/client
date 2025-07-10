import type { PrestataireAssureur } from './prestataire-assureur';
import { DemandeCommStatut } from '@/enums/demande-comm-statut';

export interface DemandeCommAssureur {
  id: string
  prestataire: PrestataireAssureur
  message: string
  statut: DemandeCommStatut
  dateEnvoi: string
  dateReponse?: string
}
