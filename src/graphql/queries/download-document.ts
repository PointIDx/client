import { gql } from 'graphql-tag';

export const DOWNLOAD_DOCUMENT_QUERY = gql`
  query DownloadDocument($documentName: String!) {
    downloadDocument(documentName: $documentName) {
      url
      filename
      contentType
    }
  }
`;