import { gql } from '@apollo/client/core'

export const UPDATE_PRESTATAIRE_PROFILE_MUTATION = gql`
  mutation UpdatePrestataireProfile($input: PrestataireProfileUpdateInput!) {
    updatePrestataireProfile(input: $input) {
      id
      companyInfo {
        raisonSociale
        siret
        adresse
        codePostal
        ville
        telephone
        email
      }
      sectors
      specialties
      description
      serviceRadius
      hourlyRate
      availabilityStatus
    }
  }
`

export const UPDATE_PRESTATAIRE_AVAILABILITY_MUTATION = gql`
  mutation UpdatePrestataireAvailability($status: AvailabilityStatus!) {
    updatePrestataireAvailability(status: $status) {
      id
      availabilityStatus
    }
  }
`

export interface PrestataireProfileUpdateInput {
  companyInfo?: {
    telephone?: string
    email?: string
    adresse?: string
    codePostal?: string
    ville?: string
  }
  sectors?: string[]
  specialties?: string[]
  description?: string
  serviceRadius?: number
  hourlyRate?: number
}

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable'