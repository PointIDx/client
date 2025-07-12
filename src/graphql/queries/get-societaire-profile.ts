import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_PROFILE = gql`
  query GetSocietaireProfile($dossierNumber: String!) {
    getSocietaireProfile(dossierNumber: $dossierNumber) {
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
      policyInfo {
        policyNumber
        coverageType
        startDate
        endDate
        deductible
        coverageLimit
      }
      accountStatus
      lastLoginDate
      createdAt
      updatedAt
    }
  }
`;