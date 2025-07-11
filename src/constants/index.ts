// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
} as const

// File types
export const ACCEPTED_FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

// Validation constants
export const VALIDATION_RULES = {
  SIRET_LENGTH: 14,
  MIN_PASSWORD_LENGTH: 8,
  MAX_COMMENT_LENGTH: 1000,
  MIN_COMPANY_NAME_LENGTH: 2,
} as const

// Timeout durations
export const TIMEOUT_DURATIONS = {
  SUCCESS_MESSAGE: 3000,
  ERROR_MESSAGE: 5000,
  MISSION_SUCCESS: 5000,
  API_REQUEST: 30000,
} as const

// API endpoints
export const API_ENDPOINTS = {
  SIRET: '/api/siret',
  GRAPHQL: '/graphql',
  UPLOADS: '/uploads',
} as const

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_SIRET: 'SIRET invalide (14 chiffres requis)',
  INVALID_FILE_TYPE: 'Type de fichier non autorisé',
  FILE_TOO_LARGE: 'Fichier trop volumineux',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas',
  SIRET_NOT_FOUND: 'SIRET non trouvé ou invalide',
} as const

// French regions
export const REGIONS = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur',
] as const

// French departments
export const DEPARTEMENTS = [
  '01 - Ain', '02 - Aisne', '03 - Allier', '04 - Alpes-de-Haute-Provence', '05 - Hautes-Alpes',
  '06 - Alpes-Maritimes', '07 - Ardèche', '08 - Ardennes', '09 - Ariège', '10 - Aube',
  '11 - Aude', '12 - Aveyron', '13 - Bouches-du-Rhône', '14 - Calvados', '15 - Cantal',
  '16 - Charente', '17 - Charente-Maritime', '18 - Cher', '19 - Corrèze', '20A - Corse-du-Sud',
  '20B - Haute-Corse', '21 - Côte-d\'Or', '22 - Côtes-d\'Armor', '23 - Creuse', '24 - Dordogne',
  '25 - Doubs', '26 - Drôme', '27 - Eure', '28 - Eure-et-Loir', '29 - Finistère',
  '30 - Gard', '31 - Haute-Garonne', '32 - Gers', '33 - Gironde', '34 - Hérault',
  '35 - Ille-et-Vilaine', '36 - Indre', '37 - Indre-et-Loire', '38 - Isère', '39 - Jura',
  '40 - Landes', '41 - Loir-et-Cher', '42 - Loire', '43 - Haute-Loire', '44 - Loire-Atlantique',
  '45 - Loiret', '46 - Lot', '47 - Lot-et-Garonne', '48 - Lozère', '49 - Maine-et-Loire',
  '50 - Manche', '51 - Marne', '52 - Haute-Marne', '53 - Mayenne', '54 - Meurthe-et-Moselle',
  '55 - Meuse', '56 - Morbihan', '57 - Moselle', '58 - Nièvre', '59 - Nord',
  '60 - Oise', '61 - Orne', '62 - Pas-de-Calais', '63 - Puy-de-Dôme', '64 - Pyrénées-Atlantiques',
  '65 - Hautes-Pyrénées', '66 - Pyrénées-Orientales', '67 - Bas-Rhin', '68 - Haut-Rhin',
  '69 - Rhône', '70 - Haute-Saône', '71 - Saône-et-Loire', '72 - Sarthe', '73 - Savoie',
  '74 - Haute-Savoie', '75 - Paris', '76 - Seine-Maritime', '77 - Seine-et-Marne', '78 - Yvelines',
  '79 - Deux-Sèvres', '80 - Somme', '81 - Tarn', '82 - Tarn-et-Garonne', '83 - Var',
  '84 - Vaucluse', '85 - Vendée', '86 - Vienne', '87 - Haute-Vienne', '88 - Vosges',
  '89 - Yonne', '90 - Territoire de Belfort', '91 - Essonne', '92 - Hauts-de-Seine',
  '93 - Seine-Saint-Denis', '94 - Val-de-Marne', '95 - Val-d\'Oise',
] as const

// Legal forms
export const FORMES_JURIDIQUES = [
  'SARL', 'SAS', 'SASU', 'EURL', 'SA', 'SNC', 'SCS', 'EI', 'EIRL', 'Micro-entreprise'
] as const

// Insurance types
export const TYPES_ASSURANCE = [
  'Responsabilité Civile Professionnelle',
  'Assurance Décennale',
  'Assurance Multirisque Professionnelle',
  'Assurance Auto Professionnelle',
  'Assurance Matériel Professionnel',
  'Protection Juridique',
  'Cyber Assurance',
  'Assurance Perte d\'exploitation',
] as const

// Project types
export const TYPES_PROJET = [
  'Sinistre habitation',
  'Travaux de rénovation',
  'Construction neuve',
  'Dégât des eaux',
  'Incendie',
  'Cambriolage',
  'Bris de glace',
  'Autre',
] as const

// Activity sectors
export const SECTEURS_ACTIVITE = [
  'Plomberie',
  'Électricité',
  'Chauffage',
  'Climatisation',
  'Maçonnerie',
  'Charpente',
  'Couverture',
  'Menuiserie',
  'Peinture',
  'Carrelage',
  'Serrurerie',
  'Vitrerie',
  'Isolation',
  'Domotique',
  'Paysagisme',
  'Nettoyage',
  'Désamiantage',
  'Démolition',
  'Autre',
] as const

// Default values
export const DEFAULT_VALUES = {
  COUNTRY: 'France',
  CURRENCY: 'EUR',
  LOCALE: 'fr-FR',
  PAGINATION_LIMIT: 10,
} as const