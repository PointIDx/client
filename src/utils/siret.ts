import { API_ENDPOINTS, VALIDATION_RULES, VALIDATION_MESSAGES, DEFAULT_VALUES } from '@/constants'
import type { CompanyInfo } from '@/interfaces/company-info'

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
 * Fetches company information from SIRET API
 */
export async function fetchSiretInfo(siret: string): Promise<SiretValidationResult> {
  try {
    if (!validateSiretFormat(siret)) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES.INVALID_SIRET
      }
    }

    const response = await fetch(`${API_ENDPOINTS.SIRET}/${siret}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      return {
        isValid: false,
        error: errorData.message || VALIDATION_MESSAGES.SIRET_NOT_FOUND
      }
    }

    const data: SiretApiResponse = await response.json()
    const { uniteLegale, adresseEtablissement, dateCreationEtablissement } = data.etablissement

    // Map numeric juridical form codes to text values
    const mapJuridicalForm = (code: string): string => {
      const mapping: Record<string, string> = {
        '5499': 'SAS', // Société par actions simplifiée
        '5720': 'SARL', // Société à responsabilité limitée
        '5710': 'SA', // Société anonyme
        '5785': 'SASU', // Société par actions simplifiée à associé unique
        '5498': 'EURL', // Entreprise unipersonnelle à responsabilité limitée
      }
      return mapping[code] || ''
    }

    const companyInfo: CompanyInfo = {
      siret: siret.replace(/\s+/g, ''),
      raisonSociale: uniteLegale.denominationUniteLegale,
      formeJuridique: mapJuridicalForm(uniteLegale.categorieJuridiqueUniteLegale),
      adresse: `${adresseEtablissement.numeroVoieEtablissement} ${adresseEtablissement.typeVoieEtablissement} ${adresseEtablissement.libelleVoieEtablissement}`,
      codePostal: adresseEtablissement.codePostalEtablissement,
      ville: adresseEtablissement.libelleCommuneEtablissement,
      pays: DEFAULT_VALUES.COUNTRY,
      dateCreation: dateCreationEtablissement
    }

    return {
      isValid: true,
      companyInfo
    }
  } catch (error) {
    console.error('Error fetching SIRET info:', error)
    return {
      isValid: false,
      error: 'Erreur lors de la récupération des informations SIRET'
    }
  }
}

/**
 * Formats SIRET number for display (adds spaces for readability)
 */
export function formatSiret(siret: string): string {
  if (!siret) return ''
  
  const cleanSiret = siret.replace(/\s+/g, '')
  
  if (cleanSiret.length !== VALIDATION_RULES.SIRET_LENGTH) {
    return cleanSiret
  }
  
  // Format as XXX XXX XXX XXXXX
  return cleanSiret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')
}

/**
 * Cleans SIRET number (removes spaces and special characters)
 */
export function cleanSiret(siret: string): string {
  if (!siret) return ''
  return siret.replace(/\s+/g, '')
}