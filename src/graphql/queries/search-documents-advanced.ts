import { gql } from 'graphql-tag';

export const SEARCH_DOCUMENTS_ADVANCED = gql`
  query SearchDocumentsAdvanced($input: DocumentSearchInput!) {
    searchDocumentsAdvanced(input: $input) {
      results {
        id
        filename
        originalFilename
        documentType
        uploadedAt
        fileSize
        relevanceScore
      }
      totalCount
      hasMore
      filters {
        name
        label
        options {
          value
          label
          count
        }
      }
      searchTerm
      appliedFilters {
        name
        value
        label
      }
    }
  }
`;