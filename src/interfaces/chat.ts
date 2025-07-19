export interface Chat {
  id: number
  name: string
  avatar?: string
  lastMessage: string
  time: string
  hasNewMessage: boolean
  newMessageCount: number
}

export interface Message {
  id: number
  sender: string
  message: string
  time: string
  isOwn: boolean
}

export interface ChatUser {
  id: number
  name: string
  avatar?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
}

export interface ChatFileAttachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
}

export interface ExtendedChatMessage extends Message {
  attachments?: ChatFileAttachment[]
  readBy?: number[]
  editedAt?: string
}