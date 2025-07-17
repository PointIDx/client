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
  passwordHash?: string
  accountType: 'SOCIETAIRE' | 'ASSUREUR' | 'PRESTATAIRE'
  createdAt: string
  updatedAt: string
  emailVerified: boolean
  isActive: boolean
  profile?: any
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

// GraphQL Input Interfaces
export interface LoginInput {
  email: string
  password?: string
  dossierNumber?: string
  accountType: 'SOCIETAIRE' | 'ASSUREUR' | 'PRESTATAIRE'
}

export interface SignupInput {
  email: string
  password: string
  accountType: 'SOCIETAIRE' | 'ASSUREUR' | 'PRESTATAIRE'
}

export interface SocietaireLoginInput {
  email: string
  dossierNumber: string
}

export interface SocietaireAuthResponse {
  token: string
  societaire: {
    email: string
    dossierNumber: string
  }
}

export interface AssureurSignupInput {
  companyInfo: {
    raisonSociale: string
    siret: string
    companyAddress: {
      street: string
      city: string
      postalCode: string
      country: string
    }
    licenseNumber?: string
  }
  contactInfo: {
    nom: string
    prenom: string
    phone: string
    email: string
  }
  accountInfo: {
    password: string
  }
}

export interface PrestataireSignupInput {
  companyInfo: {
    raisonSociale: string
    siret: string
    companyAddress: {
      street: string
      city: string
      postalCode: string
      country: string
    }
    licenseNumber?: string
  }
  contactInfo: {
    nom: string
    prenom: string
    phone: string
    email: string
  }
  accountInfo: {
    password: string
  }
  specializations: string[]
  certifications: string[]
  availabilityZones: string[]
}

export interface RefreshTokenInput {
  refreshToken: string
}