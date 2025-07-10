export interface DossierData {
  type: string;
  description: string;
  dateCreation: string;
  adresse: string;
  statut: string;
  prestataire: {
    nom: string;
    contact: string;
    telephone: string;
    email: string;
    specialites: string[];
  };
  estimation: string;
}
