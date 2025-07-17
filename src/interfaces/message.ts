import { MessageExpediteur } from '@/enums/message-expediteur';

export interface MessageFile {
  id: string
  fileName: string
  url: string
  contentType: string
  size: number
}

export interface Message {
  id: string
  missionId: string
  expediteur: MessageExpediteur
  contenu: string
  dateEnvoi: string
  lu: boolean
  fichiers?: MessageFile[]
}
