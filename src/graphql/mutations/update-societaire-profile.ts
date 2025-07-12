import { gql } from 'graphql-tag';

export const UPDATE_SOCIETAIRE_PROFILE = gql`
  mutation UpdateSocietaireProfile($input: SocietaireProfileUpdateInput!) {
    updateSocietaireProfile(input: $input) {
      id
      email
      dossierNumber
      personalInfo {
        firstName
        lastName
        dateOfBirth
        address {
          street
          city
          postalCode
          country
        }
        phone
        emergencyContact {
          name
          phone
          relationship
        }
      }
      preferences {
        language
        timezone
        notificationSettings {
          email
          sms
          push
          categories
        }
        communicationPreferences {
          preferredMethod
          availableHours
        }
      }
      accountStatus
      updatedAt
    }
  }
`;