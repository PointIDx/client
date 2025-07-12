import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_DOCUMENTS = gql`
  query GetSocietaireDocuments($dossierNumber: String!, $category: String, $offset: Int = 0, $limit: Int = 50) {
    getSocietaireDocuments(dossierNumber: $dossierNumber, category: $category, offset: $offset, limit: $limit) {
      documents {
        id
        dossierNumber
        fileName
        originalName
        url
        contentType
        size
        category
        description
        uploadDate
        uploadedBy
        status
        downloadCount
        lastDownloadDate
        metadata {
          key
          value
        }
      }
      totalCount
      hasMore
      categories
    }
  }
`;