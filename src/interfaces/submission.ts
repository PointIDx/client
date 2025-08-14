export interface Submission {
  id: string
  missionId: string
  prestataireId: string
  prestataire?: {
    id: string
    companyName: string
    contactPerson: string
    phone: string
    email: string
  }
  status: SubmissionStatus
  proposedPrice: number
  estimatedDuration: number // in hours
  description: string
  methodology?: string
  materialsIncluded: boolean
  materialsDescription?: string
  startDate?: string
  endDate?: string
  validUntil: string
  submittedAt: string
  updatedAt: string
  attachments?: SubmissionDocument[]
  notes?: string
}

export interface SubmissionDocument {
  id: string
  submissionId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface SubmissionCreateInput {
  missionId: string
  prestataireId: string
  invitationMessage?: string
  requestedDeadline?: string
  specificRequirements?: string
  estimatedBudget?: number
}

export interface SubmissionInvitation {
  id: string
  missionId: string
  prestataireId: string
  prestataire: {
    id: string
    companyName: string
    contactPerson: string
    phone: string
    email: string
  }
  invitedBy: string // assureur id
  invitedAt: string
  invitationMessage?: string
  requestedDeadline?: string
  specificRequirements?: string
  estimatedBudget?: number
  status: InvitationStatus
  submission?: Submission
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export interface SubmissionUpdateInput {
  submissionId: string
  status?: SubmissionStatus
  proposedPrice?: number
  estimatedDuration?: number
  description?: string
  methodology?: string
  materialsIncluded?: boolean
  materialsDescription?: string
  startDate?: string
  endDate?: string
  validUntil?: string
  notes?: string
}