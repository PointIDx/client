export interface IMission {
  id: string;
  prestataire: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    raisonSociale: string;
    ville: string;
  };
  client: {
    civilite: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    codePostal: string;
    ville: string;
  };
  chantier: {
    adresse: string;
    codePostal: string;
    ville: string;
    typeAcces: string;
    etage: string;
    contraintes: string;
  };
  sinistre: {
    type: string;
    description: string;
    urgence: string;
    dateSinistre: string;
    dateIntervention: string;
    numeroSinistre: string;
  };
  mission: {
    titre: string;
    description: string;
    budgetEstime: string;
    delaiSouhaite: string;
    horaires: string;
    materiaux: string;
    normes: string;
    conditionsParticulieres: string;
  };
  documents: File[];
  statut: string;
  dateCreation: string;
  numeroMission: string;
  dateEnvoi?: string;
  dateReponse?: string;
  dateFinPrevue?: string;
}