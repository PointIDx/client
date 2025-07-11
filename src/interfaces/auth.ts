export interface JWTTokens {
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  tokens: JWTTokens
  user: User
}

export interface User {
  id: string
  email: string
  type: 'societaire' | 'assureur' | 'prestataire'
  profile?: SocietaireProfile | AssureurProfile | PrestataireProfile
}

export interface SocietaireProfile {
  dossierNumber: string
  firstName?: string
  lastName?: string
}

export interface AssureurProfile {
  companyName: string
  agreementNumber?: string
  regions: string[]
}

export interface PrestataireProfile {
  companyName: string
  siret: string
  sectors: string[]
  regions: string[]
}