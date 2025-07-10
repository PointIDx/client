import { HistoriqueType } from '@/enums/historique-type';

export interface HistoriqueItem {
  auteur: string;
  message: string;
  date: string;
  type: HistoriqueType;
  fichiers: string[];
}
