import { MessageExpediteur } from '@/enums/message-expediteur';

export interface Message {
  id: string
  missionId: string
  expediteur: MessageExpediteur
  contenu: string
  dateEnvoi: string
  lu: boolean
}
