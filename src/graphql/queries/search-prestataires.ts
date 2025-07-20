import { gql } from 'graphql-tag';

export const SEARCH_PRESTATAIRES_QUERY = gql`
  query SearchPrestataires($input: PrestataireSearchInput!) {
    searchPrestataires(input: $input) {
      id
      userId
      companyName
      contactPerson
      email
      phone
      address {
        street
        city
        postalCode
        country
      }
      specialties
      rating
      distance
      availabilityStatus
    }
  }
`;
