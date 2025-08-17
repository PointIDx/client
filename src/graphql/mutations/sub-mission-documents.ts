import { gql } from '@apollo/client/core'

export const UPLOAD_SUB_MISSION_DOCUMENT_MUTATION = gql`
  mutation UploadSubMissionDocument($subMissionId: UUID!, $file: Upload!, $description: String) {
    uploadSubMissionDocument(input: {
      subMissionId: $subMissionId
      file: $file
      description: $description
    }) {
      id
      filename
      fileType
      fileSize
      uploadedAt
      metadata
      ownerId
    }
  }
`

// Using the general DELETE_DOCUMENT_MUTATION from mission-documents.ts
// since all documents use the same deletion mechanism