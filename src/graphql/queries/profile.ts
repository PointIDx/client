import { gql } from '@apollo/client/core'

export const GET_MY_PRESTATAIRE_PROFILE_QUERY = gql`
  query GetMyPrestataireProfile {
    getMyPrestataireProfile {
      id
      companyName
      siret
    }
  }
`

export const GET_MY_ASSUREUR_PROFILE_QUERY = gql`
  query GetMyAssureurProfile {
    getMyAssureurProfile {
      id
      companyName
      siret
    }
  }
`

export const UPDATE_PRESTATAIRE_PROFILE_MUTATION = gql`
  mutation UpdatePrestataireProfile($input: PrestataireProfileUpdateInput!) {
    updatePrestataireProfile(input: $input) {
      id
      companyName
      siret
      email
      phone
      address
      city
      postalCode
      website
      description
      specialties
      createdAt
      updatedAt
      secteursActivite
      zonesGeographiques {
        departements
        regions
        codesPostaux
      }
      availabilityStatus
      rating
    }
  }
`

export const UPDATE_ASSUREUR_PROFILE_MUTATION = gql`
  mutation UpdateAssureurProfile($input: AssureurProfileUpdateInput!) {
    updateAssureurProfile(input: $input) {
      id
      companyName
      siret
      email
      phone
      address
      city
      postalCode
      website
      description
      createdAt
      updatedAt
      numeroAgrement
      typesAssurance
      zonesCouverture {
        departements
        regions
        codesPostaux
      }
      garantiesProposees
    }
  }
`

export interface PrestataireInfo {
  id: string
  companyName: string
  siret: string
}

export interface AssureurInfo {
  id: string
  companyName: string
  siret: string
}

export interface PrestataireProfileUpdateInput {
  companyName?: string
  siret?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  website?: string
  description?: string
  specialties?: string[]
  secteursActivite?: string
  zonesGeographiques?: {
    departements?: string[]
    regions?: string[]
    codesPostaux?: string[]
  }
}

export interface AssureurProfileUpdateInput {
  companyName?: string
  siret?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  website?: string
  description?: string
  numeroAgrement?: string
  typesAssurance?: string[]
  zonesCouverture?: {
    departements?: string[]
    regions?: string[]
    codesPostaux?: string[]
  }
  garantiesProposees?: string
}