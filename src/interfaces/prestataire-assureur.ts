export interface PrestataireAssureur {
  id: string
  nom: string
  raisonSociale: string
  secteurs: string[]
  specialites: string[]
  ville: string
  departement: string
  region: string
  notemoyenne: number
  nombreAvis: number
  siret: string
  formeJuridique: string
  dateCreation: string
  telephone: string
  email: string
  adresse: string
  description: string
  certifications: string[]
  documentsPublics: string[]
  avatar?: string
}
