import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/constants'
import type { CompanyInfo } from '@/interfaces/company-info'
import apolloClient from '@/apollo-client'
import { VALIDATE_SIRET_QUERY } from '@/graphql/queries/validate-siret'

export interface SiretApiResponse {
  etablissement: {
    uniteLegale: {
      denominationUniteLegale: string
      categorieJuridiqueUniteLegale: string
    }
    adresseEtablissement: {
      numeroVoieEtablissement: string
      typeVoieEtablissement: string
      libelleVoieEtablissement: string
      codePostalEtablissement: string
      libelleCommuneEtablissement: string
    }
    dateCreationEtablissement: string
  }
}

export interface SiretValidationResult {
  isValid: boolean
  companyInfo?: CompanyInfo
  error?: string
}

/**
 * Validates a SIRET number format
 */
export function validateSiretFormat(siret: string): boolean {
  if (!siret || typeof siret !== 'string') {
    return false
  }
  
  // Remove any spaces or special characters
  const cleanSiret = siret.replace(/\s+/g, '')
  
  // Check if it's exactly 14 digits
  return cleanSiret.length === VALIDATION_RULES.SIRET_LENGTH && /^\d{14}$/.test(cleanSiret)
}

/**
 * Fetches company information from SIRET via GraphQL backend
 */
export async function fetchSiretInfo(siret: string): Promise<SiretValidationResult> {
  try {
    if (!validateSiretFormat(siret)) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES.INVALID_SIRET
      }
    }

    const { data } = await apolloClient.query({
      query: VALIDATE_SIRET_QUERY,
      variables: { siret: siret.replace(/\s+/g, '') },
      fetchPolicy: 'network-only'
    })

    const result = data.validateSiret

    if (!result.isValid) {
      return {
        isValid: false,
        error: result.error || VALIDATION_MESSAGES.SIRET_NOT_FOUND
      }
    }

    return {
      isValid: true,
      companyInfo: result.companyInfo
    }
  } catch (error) {
    console.error('Error fetching SIRET info:', error)
    return {
      isValid: false,
      error: 'Erreur lors de la récupération des informations SIRET'
    }
  }
}


