import { gql } from 'graphql-tag';

export const SEARCH_SOCIETAIRE_HISTORY = gql`
  query SearchSocietaireHistory($input: SocietaireHistorySearchInput!) {
    searchSocietaireHistory(input: $input) {
      results {
        id
        dossierNumber
        type
        title
        description
        date
        author
        category
        tags
        relatedEntities {
          id
          type
          name
        }
        attachments {
          id
          fileName
          url
          contentType
        }
        metadata {
          key
          value
        }
      }
      totalCount
      hasMore
      filters {
        categories
        authors
        dateRange {
          min
          max
        }
        tags
      }
      searchTerm
      appliedFilters
    }
  }
`;