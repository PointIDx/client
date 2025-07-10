import { TimelineStatut } from '@/enums/timeline-statut';

export interface TimelineItem {
  etape: string;
  description: string;
  date: string;
  statut: TimelineStatut;
  icon: any; // You might want to define a more specific type for icons if possible
}
