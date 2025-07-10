import type { Prestataire } from './prestataire';
import { DemandeCommStatut } from '@/enums/demande-comm-statut';

export interface DemandeComm {
  id: string
  prestataire: Prestataire
  message: string
  statut: DemandeCommStatut
  dateEnvoi: string
  dateReponse?: string
}
