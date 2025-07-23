// Interface that matches the enhanced GraphQL MissionDetails type from the schema
export interface MissionDetails {
  // Core mission fields
  id: string;
  reference: string;
  status: string;
  dateDeCreation: string;
  urgence: string;
  description: string;
  estimatedCost?: number;
  actualCost?: number;
  location: Address;
  deadline?: string;

  // Related entities
  societaire?: MissionSocietaire;
  prestataire?: MissionPrestataire;
  documents: MissionDocument[];
  historique: Historique[];
  commentaires: Comment[];

  // Client information
  civilite?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;

  // Site/Worksite information
  chantierAdresse?: string;
  chantierCodePostal?: string;
  chantierVille?: string;
  chantierTypeAcces?: string;
  chantierEtage?: string;
  chantierContraintes?: string;
  chantierMemeAdresseClient?: boolean;

  // Incident information
  sinistreType?: string;
  sinistreDescription?: string;
  sinistreUrgence?: string;
  sinistreDateSinistre?: string;
  sinistreDateIntervention?: string;
  numeroSinistre?: string;

  // Mission information
  titre?: string;
  budgetEstime?: string;
  delaiSouhaite?: string;
  horaires?: string;
  materiaux?: string;
  normes?: string;
  conditionsParticulieres?: string;

  // Communication preferences
  emailClient?: boolean;
  smsClient?: boolean;
  creerAccesClient?: boolean;
}

// Related types
export interface MissionSocietaire {
  id: string;
  dossierNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
}

export interface MissionPrestataire {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface MissionDocument {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  uploadDate: string;
  description?: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  missionId: string;
  userId: string;
  expediteur: string;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
  createdAt: string;
}

export interface Historique {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Enums
export enum MissionStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  ASSIGNEE = 'ASSIGNEE',
  EN_COURS = 'EN_COURS',
  COMPLETEE = 'COMPLETEE',
  ANNULEE = 'ANNULEE',
  SUSPENDUE = 'SUSPENDUE'
}

export enum UrgenceLevel {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE'
}