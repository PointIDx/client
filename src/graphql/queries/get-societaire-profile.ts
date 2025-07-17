import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_PROFILE = gql`
  query GetSocietaireProfile($dossierNumber: String!) {
    getSocietaireProfile(dossierNumber: $dossierNumber) {
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