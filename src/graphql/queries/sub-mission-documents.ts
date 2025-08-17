import { gql } from '@apollo/client/core'

export const GET_SUB_MISSION_DOCUMENTS_QUERY = gql`
  query GetSubMissionDocuments($subMissionId: UUID!) {
    getSubMissionDocuments(subMissionId: $subMissionId) {
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

// Using the general GET_DOCUMENT_DOWNLOAD_URL_QUERY from mission-documents.ts
// since all documents use the same download mechanism