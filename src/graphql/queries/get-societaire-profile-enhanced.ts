import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_PROFILE_ENHANCED_QUERY = gql`
  query GetSocietaireProfileEnhanced($dossierNumber: String!) {
    getSocietaireProfileEnhanced(dossierNumber: $dossierNumber) {
      id
      email
      dossierNumber
      personalInfo {
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
        policyType
        startDate
        endDate
        coverageAmount
        premium
      }
      accountStatus
      lastLoginDate
      createdAt
      updatedAt
    }
  }
`;