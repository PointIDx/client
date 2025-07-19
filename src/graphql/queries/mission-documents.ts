import { gql } from '@apollo/client/core'

export const GET_MISSION_DOCUMENTS_QUERY = gql`
  query GetMissionDocuments($missionId: UUID!) {
    getMissionDocuments(missionId: $missionId) {
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

export const GET_DOCUMENT_DOWNLOAD_URL_QUERY = gql`
  query GetDocumentDownloadUrl($documentId: UUID!) {
    getDocumentDownloadUrl(documentId: $documentId) {
      url
      filename
      contentType
      expiresAt
    }
  }
`