export interface Prestataire {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  specialties: string[];
  rating: number | null;
  distance: number | null;
  availabilityStatus: string;
  // Fields from the old interface that might still be used elsewhere
  nom?: string;
  prenom?: string;
  raisonSociale?: string;
  secteurs?: string[];
  ville?: string;
  departement?: string;
  region?: string;
  notemoyenne?: number;
  nombreAvis?: number;
  siret?: string;
  formeJuridique?: string;
  dateCreation?: string;
  telephone?: string;
  adresse?: string;
  description?: string;
  certifications?: string[];
  documentsPublics?: string[];
  avatar?: string;
}