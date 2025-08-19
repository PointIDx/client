// Re-export all interfaces for easier importing
export type { 
  ChatRoom, 
  Message, 
  ChatMessage, 
  RoomParticipant, 
  ChatFileAttachment, 
  ExtendedChatMessage 
} from '@/interfaces/chat'
export type { Mission } from '@/interfaces/mission'
export type { MissionDetails } from '@/interfaces/MissionDetails'
export type { 
  SubMission, 
  SubMissionDetails, 
  SubMissionCreateInput, 
  SubMissionAssignInput, 
  SubMissionUpdateInput, 
  SubMissionStatusUpdateInput,
  UrgenceLevel,
  MissionStatut,
  Specialization 
} from '@/interfaces/sub-mission'
export type { Prestataire } from '@/interfaces/prestataire'
export type { CompanyInfo } from '@/interfaces/company-info'
export type { Contact } from '@/interfaces/contact'
export type { ProviderInfo } from '@/interfaces/provider-info'
export type { Account } from '@/interfaces/account'
export type { User } from '@/interfaces/user'