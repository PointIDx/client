import { gql } from 'graphql-tag';

export const GLOBAL_SEARCH = gql`
  query GlobalSearch($input: GlobalSearchInput!) {
    globalSearch(input: $input) {
      results {
        id
        entityType
        title
        description
        createdAt
        relevanceScore
        metadata
      }
      totalCount
      hasMore
      searchTerm
      entityTypes
    }
  }
`;