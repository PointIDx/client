import { gql } from '@apollo/client/core'

export const SEND_FILE_WITH_MESSAGE_MUTATION = gql`
  mutation SendFileWithMessage($input: FileMessageInput!) {
    sendFileWithMessage(input: $input) {
      id
      missionId
      expediteur
      contenu
      dateEnvoi
      fichiers {
        id
        fileName
        url
        contentType
        size
      }
      lu
    }
  }
`

export const UPLOAD_MISSION_DOCUMENT_MUTATION = gql`
  mutation UploadMissionDocument($input: MissionDocumentInput!) {
    uploadMissionDocument(input: $input) {
      id
      fileName
      url
      contentType
      size
      uploadDate
      description
    }
  }
`

export interface FileMessageInput {
  missionId: string
  contenu?: string
  files: File[]
}

export interface MissionDocumentInput {
  missionId: string
  file: File
  description?: string
  category: DocumentCategory
}

export type DocumentCategory = 'quote' | 'invoice' | 'photos_before' | 'photos_after' | 'report' | 'certificate' | 'other'

export interface MissionDocument {
  id: string
  fileName: string
  url: string
  contentType: string
  size: number
  uploadDate: string
  description?: string
  category: DocumentCategory
}