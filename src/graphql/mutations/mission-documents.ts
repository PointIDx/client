import { gql } from '@apollo/client/core'

export const UPLOAD_MISSION_DOCUMENT_MUTATION = gql`
  mutation UploadMissionDocument($input: MissionDocumentInput!) {
    uploadMissionDocument(input: $input) {
      id
      filename
      url
      contentType
      size
      uploadDate
      description
      uploadedBy
    }
  }
`

export const UPLOAD_MISSION_FILE_MUTATION = gql`
  mutation UploadMissionFile($input: MissionDocumentInput!) {
    uploadMissionFile(input: $input) {
      id
      filename
      url
      contentType
      size
      uploadDate
      description
      uploadedBy
    }
  }
`

export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($documentId: UUID!) {
    deleteDocument(documentId: $documentId)
  }
`

export const UPDATE_DOCUMENT_METADATA_MUTATION = gql`
  mutation UpdateDocumentMetadata($documentId: UUID!, $metadata: JSON!) {
    updateDocumentMetadata(documentId: $documentId, metadata: $metadata)
  }
`