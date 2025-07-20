// Backend schema enums
export enum RoomType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export enum ChatMessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  SYSTEM = 'system'
}

export enum ParticipantRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

// Backend schema interfaces
export interface ChatRoom {
  id: string
  roomType: RoomType
  participants: string[]
  name?: string
  description?: string
  avatarUrl?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
  lastMessageId?: string
  lastMessageAt?: string
  isArchived: boolean
  unreadCount?: number
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId?: string
  content?: string
  messageType: ChatMessageType
  sentAt: string
  editedAt?: string
  replyToId?: string
  fileAttachments: string[]
  isRead: boolean
  senderName?: string
  senderAvatar?: string
}

export interface RoomParticipant {
  id: string
  roomId: string
  userId: string
  role: ParticipantRole
  joinedAt: string
  lastSeenAt: string
  isMuted: boolean
  userName?: string
  userAvatar?: string
}

export interface ChatFileAttachment {
  id: string
  messageId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}

export interface TypingIndicator {
  userId: string
  roomId: string
  userName?: string
  isTyping: boolean
  timestamp: string
}

export interface ChatEventPayload {
  type: string
  roomId: string
  data: any
}

export interface ChatRoomWithLastMessage extends ChatRoom {
  lastMessage?: ChatMessage
}

// Input types for mutations
export interface CreateChatRoomInput {
  roomType: RoomType
  name?: string
  description?: string
  participantIds: string[]
}

export interface SendChatMessageInput {
  roomId: string
  content?: string
  messageType: ChatMessageType
  replyToId?: string
  fileAttachments?: string[]
}

export interface EditChatMessageInput {
  messageId: string
  content: string
}

export interface MarkMessageAsReadInput {
  messageId: string
}

export interface SetTypingIndicatorInput {
  roomId: string
  isTyping: boolean
}

export interface AddParticipantInput {
  roomId: string
  userId: string
  role?: ParticipantRole
}

export interface RemoveParticipantInput {
  roomId: string
  userId: string
}

export interface UpdateRoomInput {
  roomId: string
  name?: string
  description?: string
  avatarUrl?: string
}

// Legacy interfaces for compatibility (will be phased out)
export interface Chat {
  id: string // Changed from number to string to match backend
  name: string
  avatar?: string
  lastMessage: string
  time: string
  hasNewMessage: boolean
  newMessageCount: number
  isMuted?: boolean
  isOnline?: boolean
}

export interface Message {
  id: string // Changed from number to string to match backend
  sender: string
  message: string
  time: string
  isOwn: boolean
  isRead?: boolean
  editedAt?: string
  replyTo?: {
    id: string
    sender: string
    content: string
  }
}

export interface ChatUser {
  id: string // Changed from number to string to match backend
  name: string
  avatar?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
}

export interface ExtendedChatMessage extends Message {
  attachments?: ChatFileAttachment[]
  readBy?: string[] // Changed from number[] to string[] to match backend
  editedAt?: string
}