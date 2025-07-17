import { gql } from 'graphql-tag';

export const SEARCH_MISSIONS = gql`
  query SearchMissions($input: MissionSearchInput!) {
    searchMissions(input: $input) {
      results {
        id
        reference
        title
        description
        status
        urgency
        createdAt
        deadline
        location {
          street
          city
          postalCode
          country
        }
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