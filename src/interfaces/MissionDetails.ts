// Interface that matches the GraphQL MissionDetails type from the schema
export interface MissionDetails {
  id: string;
  reference: string;
  status: string;
  dateDeCreation: string;
  urgence: string;
  description: string;
  societaire: {
    id: string;
    dossierNumber: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
  };
  prestataire?: {
    id: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
  documents: Array<{
    id: string;
    filename: string;
    url: string;
    contentType: string;
    size: number;
    uploadDate: string;
    description?: string;
    uploadedBy: string;
  }>;
  historique: Array<{
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
  }>;
  commentaires: Array<{
    id: string;
    missionId: string;
    userId: string;
    expediteur: string;
    contenu: string;
    dateEnvoi: string;
    lu: boolean;
    createdAt: string;
  }>;
  estimatedCost?: number;
  actualCost?: number;
  location: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deadline?: string;
}