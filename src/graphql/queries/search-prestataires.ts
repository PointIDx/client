import { gql } from 'graphql-tag';

export const SEARCH_PRESTATAIRES_QUERY = gql`
  query SearchPrestataires($location: String, $specialty: String, $name: String) {
    searchPrestataires(location: $location, specialty: $specialty, name: $name) {
      id
      companyName
      contactPerson
      email
      phone
      address
      specialties
    }
  }
`;
