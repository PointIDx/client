import { gql } from 'graphql-tag';

export const UPDATE_SOCIETAIRE_PROFILE = gql`
  mutation UpdateSocietaireProfile($input: SocietaireProfileUpdateInput!) {
    updateSocietaireProfile(input: $input) {
      id
      userId
      dossierNumber
      firstName
      lastName
      dateOfBirth
      phone
      address {
        street
        city
        postalCode
        country
      }
      emergencyContact {
        name
        phone
        relationship
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
    }
  }
`;