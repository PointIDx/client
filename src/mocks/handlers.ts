import { graphql, HttpResponse, http } from 'msw'

// Stateful mock data for missions
let mockMissions = [
  {
    id: 'mission-1',
    missionStatus: 'nouvelle',
    dossier: {
      id: 'dossier-1',
      dossierNumber: 'DOSS-001',
      description: 'Fuite d\'eau dans la cuisine',
      address: '123 Rue de la Fuite, Paris',
      type: 'Dégât des eaux',
    },
    assureur: {
      id: 'assureur-1',
      companyName: 'Assurance Alpha',
    },
    dateCreation: '2024-01-15T10:00:00Z',
    nouveauxMessages: 2,
  },
  {
    id: 'mission-2',
    missionStatus: 'en_cours',
    dossier: {
      id: 'dossier-2',
      dossierNumber: 'DOSS-002',
      description: 'Fenêtre cassée',
      address: '456 Avenue du Verre, Lyon',
      type: 'Bris de glace',
    },
    assureur: {
      id: 'assureur-2',
      companyName: 'Assurance Beta',
    },
    dateCreation: '2024-01-16T11:00:00Z',
    nouveauxMessages: 0,
  },
  {
    id: 'mission-3',
    missionStatus: 'terminee',
    dossier: {
      id: 'dossier-3',
      dossierNumber: 'DOSS-003',
      description: 'Porte d\'entrée forcée',
      address: '789 Boulevard de la Clé, Marseille',
      type: 'Serrurerie',
    },
    assureur: {
      id: 'assureur-1',
      companyName: 'Assurance Alpha',
    },
    dateCreation: '2024-01-14T09:30:00Z',
    nouveauxMessages: 1,
  },
];

export const handlers = [
  // GraphQL SIRET validation
  graphql.query('ValidateSiret', ({ variables }) => {
    const { siret } = variables;
    
    // Mock validation for testing
    if (siret === '12345678901234') {
      return HttpResponse.json({
        data: {
          validateSiret: {
            isValid: true,
            companyInfo: {
              siret: '12345678901234',
              raisonSociale: 'ASSURANCE TEST SA',
              formeJuridique: 'SA',
              adresse: '10 RUE DE LA PAIX',
              codePostal: '75001',
              ville: 'PARIS',
              pays: 'France',
              dateCreation: '2020-01-01',
            },
            error: null
          }
        }
      });
    } else if (siret === '98765432109876') {
      return HttpResponse.json({
        data: {
          validateSiret: {
            isValid: true,
            companyInfo: {
              siret: '98765432109876',
              raisonSociale: 'DUBOIS MAÇONNERIE SARL',
              formeJuridique: 'SARL',
              adresse: '123 RUE DE LA PAIX',
              codePostal: '75001',
              ville: 'PARIS',
              pays: 'France',
              dateCreation: '2010-05-15',
            },
            error: null
          }
        }
      });
    } else if (siret === '11111111111111') {
      return HttpResponse.json({
        data: {
          validateSiret: {
            isValid: false,
            companyInfo: null,
            error: 'SIRET non trouvé ou invalide'
          }
        }
      });
    } else {
      return HttpResponse.json({
        data: {
          validateSiret: {
            isValid: false,
            companyInfo: null,
            error: 'SIRET non trouvé ou invalide'
          }
        }
      });
    }
  }),

  // Intercept "viewer" GraphQL query.
  graphql.query('viewer', () => {
    return HttpResponse.json({
      data: {
        viewer: {
          id: '1',
          __typename: 'User',
          firstName: 'John',
          lastName: 'Maverick',
        },
      },
    })
  }),

  // Intercept "Login" GraphQL mutation.
  graphql.mutation<{}>('Login', (req) => {
    const { input } = req.variables;
    const { email, password, accountType } = input || {};

    // Assureur login
    if (email === 'assureur@test.com' && password === 'password123' && accountType === 'ASSUREUR') {
      return HttpResponse.json({
        data: {
          login: {
            tokens: {
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFzc3VyZXVyIFRlc3QiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.Twj8hZhS7ZX6vJl9NwJdJKQlQcH3KnM0hFkB1sP4aZw',
              refreshToken: 'refresh_token_assureur_123',
              expiresIn: 3600
            },
            user: {
              id: '1',
              email: email,
              passwordHash: '[REDACTED]',
              accountType: 'ASSUREUR',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z',
              emailVerified: true,
              isActive: true,
              profile: {
                companyName: 'Test Insurance Company',
                agreementNumber: 'AGR123456',
                regions: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur']
              }
            }
          },
        },
      });
    }
    // Prestataire login
    else if (email === 'prestataire@test.com' && password === 'password123' && accountType === 'PRESTATAIRE') {
      return HttpResponse.json({
        data: {
          login: {
            tokens: {
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOTg3NjU0MzIxIiwibmFtZSI6IlByZXN0YXRhaXJlIFRlc3QiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
              refreshToken: 'refresh_token_prestataire_456',
              expiresIn: 3600
            },
            user: {
              id: '2',
              email: email,
              type: 'prestataire',
              profile: {
                companyName: 'Test Construction SARL',
                siret: '12345678901234',
                sectors: ['Plomberie', 'Chauffage'],
                regions: ['Île-de-France']
              }
            }
          },
        },
      });
    }
    // General test user
    else if (email === 'test@example.com' && password === 'password123' && accountType === 'ASSUREUR') {
      return HttpResponse.json({
        data: {
          login: {
            tokens: {
              token: 'mock-jwt-token',
              refreshToken: 'mock-refresh-token',
              expiresIn: 3600
            },
            user: {
              id: 'user-123',
              email: 'test@example.com',
              type: 'general'
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid credentials',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      }, { status: 401 });
    }
  }),

  // Intercept "Signup" GraphQL mutation.
  graphql.mutation('Signup', (req) => {
    const { email, password } = req.variables

    if (email && password) {
      return HttpResponse.json({
        data: {
          signup: {
            tokens: {
              token: 'mock-jwt-token-new-user',
              refreshToken: 'mock-refresh-token-new-user',
              expiresIn: 3600
            },
            user: {
              id: 'new-user-456',
              email: email,
              type: 'general'
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Missing email or password',
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          },
        ],
      }, { status: 400 });
    }
  }),

  // Intercept "RefreshToken" GraphQL mutation.
  graphql.mutation('RefreshToken', (req) => {
    const { refreshToken } = req.variables;

    if (refreshToken && (
      refreshToken === 'refresh_token_assureur_123' ||
      refreshToken === 'refresh_token_prestataire_456' ||
      refreshToken === 'mock-refresh-token' ||
      refreshToken === 'mock-refresh-token-new-user'
    )) {
      return HttpResponse.json({
        data: {
          refreshToken: {
            token: 'new-mock-jwt-token',
            refreshToken: 'new-mock-refresh-token',
            expiresIn: 3600
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid refresh token',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      }, { status: 401 });
    }
  }),

  // Intercept "AssureurSignup" GraphQL mutation.
  graphql.mutation('AssureurSignup', (req) => {
    const { companyInfo, contactInfo, accountInfo, kbisFile, insuranceFile, agreementFile } = req.variables;

    if (companyInfo && contactInfo && accountInfo) {
      return HttpResponse.json({
        data: {
          assureurSignup: {
            tokens: {
              token: 'mock-assureur-jwt-token',
              refreshToken: 'mock-assureur-refresh-token',
              expiresIn: 3600
            },
            user: {
              id: 'assureur-789',
              email: accountInfo.email,
              type: 'assureur',
              profile: {
                companyName: companyInfo.raisonSociale,
                agreementNumber: 'AGR789456',
                regions: ['Île-de-France']
              }
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Missing required fields for AssureurSignup',
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          },
        ],
      }, { status: 400 });
    }
  }),

  // Intercept "PrestataireSignup" GraphQL mutation.
  graphql.mutation('PrestataireSignup', (req) => {
    const { input } = req.variables;

    if (input && input.companyInfo && input.contact && input.providerInfo && input.account) {
      return HttpResponse.json({
        data: {
          prestataireSignup: {
            token: 'mock-prestataire-jwt-token',
            expiresIn: 3600,
            refreshToken: 'mock-prestataire-refresh-token',
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Missing required fields for PrestataireSignup',
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          },
        ],
      }, { status: 400 });
    }
  }),

  // Intercept "SocietaireLogin" GraphQL mutation.
  graphql.mutation('SocietaireLogin', (req) => {
    const { email, dossierNumber } = req.variables;

    if (email === 'jean.dupont@email.com' && dossierNumber === 'DOS2024001') {
      return HttpResponse.json({
        data: {
          societaireLogin: {
            token: 'mock-societaire-token',
            societaire: {
              email: email,
              dossierNumber: dossierNumber,
              dossierData: {
                type: "Dégât des eaux",
                description: "Fuite d'eau dans la salle de bain suite à rupture de canalisation",
                dateCreation: "15 janvier 2024",
                adresse: "123 Rue de la République, 75011 Paris",
                statut: "En cours d'intervention",
                prestataire: {
                  nom: "Plomberie Martin SARL",
                  contact: "Marc Dubois",
                  telephone: "01 23 45 67 89",
                  email: "contact@plomberie-martin.fr",
                  specialites: ["Plomberie", "Chauffage", "Sanitaire"]
                },
                estimation: "1,250 €"
              },
              timeline: [
                { 
                  etape: "Dossier créé", 
                  description: "Sinistre déclaré et enregistré", 
                  date: "15 jan 2024", 
                  statut: "termine", 
                  icon: "FileText" 
                },
                { 
                  etape: "Prestataire assigné", 
                  description: "Professionnel sélectionné et contacté", 
                  date: "16 jan 2024", 
                  statut: "termine", 
                  icon: "User" 
                },
                { 
                  etape: "Mission acceptée", 
                  description: "Prise en charge confirmée par le prestataire", 
                  date: "17 jan 2024", 
                  statut: "termine", 
                  icon: "CheckCircle" 
                },
                { 
                  etape: "Intervention en cours", 
                  description: "Travaux de réparation démarrés", 
                  date: "20 jan 2024", 
                  statut: "encours", 
                  icon: "Clock" 
                },
                { 
                  etape: "Travaux terminés", 
                  description: "Intervention achevée et contrôlée", 
                  date: "", 
                  statut: "attente", 
                  icon: "CheckCircle" 
                },
                { 
                  etape: "Dossier clôturé", 
                  description: "Fermeture définitive du dossier", 
                  date: "", 
                  statut: "attente", 
                  icon: "Shield" 
                }
              ],
              historique: [
                {
                  auteur: "Prestataire",
                  message: "Intervention programmée pour demain matin à 9h. Merci de libérer l'accès à la salle de bain.",
                  date: "19 jan 2024 - 14:30",
                  type: "prestataire",
                  fichiers: []
                },
                {
                  auteur: "Client",
                  message: "Parfait, je serai présent. Voici une photo de l'état actuel des dégâts.",
                  date: "19 jan 2024 - 15:45",
                  type: "client",
                  fichiers: ["degats_sdb.jpg"]
                },
                {
                  auteur: "Assureur",
                  message: "Dossier validé. Le prestataire peut procéder aux réparations selon le devis établi.",
                  date: "18 jan 2024 - 11:20",
                  type: "assureur",
                  fichiers: ["validation_devis.pdf"]
                }
              ],
              documents: [
                { nom: "degats_sdb.jpg", type: "image", taille: "2.3 MB", auteur: "Client", date: "19 jan 2024" },
                { nom: "devis_reparation.pdf", type: "document", taille: "156 KB", auteur: "Prestataire", date: "18 jan 2024" },
                { nom: "validation_devis.pdf", type: "document", taille: "89 KB", auteur: "Assureur", date: "18 jan 2024" },
                { nom: "photos_avant.jpg", type: "image", taille: "1.8 MB", auteur: "Prestataire", date: "17 jan 2024" }
              ]
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid societaire credentials',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      }, { status: 401 });
    }
  }),

  // Intercept "SendFile" GraphQL mutation.
  graphql.mutation('SendFile', (req) => {
    const { missionId, file } = req.variables;

    if (missionId && file) {
      return HttpResponse.json({
        data: {
          sendFile: {
            success: true,
            message: 'File uploaded successfully',
            document: {
              id: `doc-${Math.random().toString(36).substring(7)}`,
              fileName: file.name,
              url: `/uploads/${file.name}`,
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Missing missionId or file',
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          },
        ],
      }, { status: 400 });
    }
  }),

  // Intercept "SendSocietaireComment" GraphQL mutation.
  graphql.mutation('SendSocietaireComment', (req) => {
    const { dossierNumber, comment } = req.variables;

    if (dossierNumber && comment) {
      return HttpResponse.json({
        data: {
          sendSocietaireComment: {
            success: true,
            message: 'Comment sent successfully',
            historiqueItem: {
              auteur: 'Client',
              message: comment,
              date: new Date().toLocaleString('fr-FR'),
              type: 'client',
              fichiers: [],
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Missing dossier number or comment',
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          },
        ],
      }, { status: 400 });
    }
  }),

  graphql.query('GetAssureurMissions', () => {
    return HttpResponse.json({
      data: {
        missions: [
          {
            id: 'M240001',
            numeroMission: 'M240001',
            statut: 'en_cours',
            dateCreation: '2024-01-15T10:00:00Z',
            dateEnvoi: '2024-01-15T11:00:00Z',
            dateReponse: '2024-01-16T09:15:00Z',
            dateFinPrevue: '2024-02-15T17:00:00Z',
            prestataire: { 
              id: 'prest-1', 
              nom: 'Marie',
              prenom: 'Moreau',
              raisonSociale: 'MOREAU PLOMBERIE',
              ville: 'Paris',
              telephone: '0143234567',
              email: 'contact@moreau-plomberie.fr'
            },
            client: { 
              civilite: 'Monsieur',
              nom: 'Dupont', 
              prenom: 'Jean',
              telephone: '0123456789',
              email: 'jean.dupont@email.com',
              adresse: '123 Rue de la Paix',
              codePostal: '75001',
              ville: 'Paris'
            },
            chantier: {
              adresse: '123 Rue de la Paix',
              codePostal: '75001',
              ville: 'Paris',
              typeAcces: 'Libre',
              etage: 'RDC',
              contraintes: 'Aucune'
            },
            sinistre: {
              type: 'Dégât des eaux',
              description: 'Fuite importante dans la salle de bain',
              urgence: 'elevee',
              dateSinistre: '2024-01-10',
              dateIntervention: '2024-01-15',
              numeroSinistre: 'SIN2024001'
            },
            mission: {
              titre: 'Réparation fuite salle de bain',
              description: 'Réparation urgente de la fuite dans la salle de bain',
              budgetEstime: '1250',
              delaiSouhaite: '2 semaines',
              horaires: '8h-17h',
              materiaux: 'Fournis par le prestataire',
              normes: 'Normes DTU',
              conditionsParticulieres: 'Accès facile'
            },
            documents: []
          },
          {
            id: 'M240002',
            numeroMission: 'M240002',
            statut: 'acceptee',
            dateCreation: '2024-01-16T11:00:00Z',
            dateEnvoi: '2024-01-16T11:30:00Z',
            dateReponse: '2024-01-16T14:15:00Z',
            prestataire: { 
              id: 'prest-2', 
              nom: 'Pierre',
              prenom: 'Leroy',
              raisonSociale: 'LEROY ÉLECTRICITÉ',
              ville: 'Lyon',
              telephone: '0144345678',
              email: 'contact@leroy-electricite.fr'
            },
            client: { 
              civilite: 'Madame',
              nom: 'Durand', 
              prenom: 'Marie',
              telephone: '0987654321',
              email: 'marie.durand@email.com',
              adresse: '456 Avenue B',
              codePostal: '69001',
              ville: 'Lyon'
            },
            chantier: {
              adresse: '456 Avenue B',
              codePostal: '69001',
              ville: 'Lyon',
              typeAcces: 'Clés chez gardien',
              etage: '3ème',
              contraintes: 'Prévenir le gardien'
            },
            sinistre: {
              type: 'Problème électrique',
              description: 'Court-circuit dans le tableau électrique',
              urgence: 'moyenne',
              dateSinistre: '2024-01-15',
              dateIntervention: '2024-01-17',
              numeroSinistre: 'SIN2024002'
            },
            mission: {
              titre: 'Réparation électrique',
              description: 'Réparation du tableau électrique suite à court-circuit',
              budgetEstime: '850',
              delaiSouhaite: '3 jours',
              horaires: '9h-17h',
              materiaux: 'Fournis par le prestataire',
              normes: 'Normes NFC 15-100',
              conditionsParticulieres: 'Coupure électrique à prévoir'
            },
            documents: []
          },
          {
            id: 'M240003',
            numeroMission: 'M240003',
            statut: 'envoyee',
            dateCreation: '2024-01-17T09:00:00Z',
            dateEnvoi: '2024-01-17T09:15:00Z',
            prestataire: { 
              id: 'prest-3', 
              nom: 'Sophie',
              prenom: 'Bernard',
              raisonSociale: 'BERNARD COUVERTURE',
              ville: 'Marseille',
              telephone: '0145456789',
              email: 'contact@bernard-couverture.fr'
            },
            client: { 
              civilite: 'Monsieur',
              nom: 'Martin', 
              prenom: 'Paul',
              telephone: '0567891234',
              email: 'paul.martin@email.com',
              adresse: '789 Boulevard C',
              codePostal: '13001',
              ville: 'Marseille'
            },
            chantier: {
              adresse: '789 Boulevard C',
              codePostal: '13001',
              ville: 'Marseille',
              typeAcces: 'Libre',
              etage: 'RDC',
              contraintes: 'Accès par l\'extérieur'
            },
            sinistre: {
              type: 'Dégât tempête',
              description: 'Tuiles endommagées par la tempête',
              urgence: 'faible',
              dateSinistre: '2024-01-15',
              dateIntervention: '2024-01-20',
              numeroSinistre: 'SIN2024003'
            },
            mission: {
              titre: 'Réparation toiture',
              description: 'Réparation de la toiture suite aux dégâts de tempête',
              budgetEstime: '2100',
              delaiSouhaite: '1 semaine',
              horaires: '8h-17h',
              materiaux: 'Fournis par le prestataire',
              normes: 'Normes DTU',
              conditionsParticulieres: 'Accès par l\'extérieur'
            },
            documents: []
          },
          {
            id: 'M240004',
            numeroMission: 'M240004',
            statut: 'terminee',
            dateCreation: '2024-01-12T08:00:00Z',
            dateEnvoi: '2024-01-12T08:30:00Z',
            dateReponse: '2024-01-12T10:20:00Z',
            dateFinPrevue: '2024-01-14T16:00:00Z',
            prestataire: { 
              id: 'prest-4', 
              nom: 'Marc',
              prenom: 'Rousseau',
              raisonSociale: 'ROUSSEAU SERRURERIE',
              ville: 'Toulouse',
              telephone: '0156567890',
              email: 'contact@rousseau-serrurerie.fr'
            },
            client: { 
              civilite: 'Madame',
              nom: 'Petit', 
              prenom: 'Julie',
              telephone: '0678912345',
              email: 'julie.petit@email.com',
              adresse: '321 Rue D',
              codePostal: '31000',
              ville: 'Toulouse'
            },
            chantier: {
              adresse: '321 Rue D',
              codePostal: '31000',
              ville: 'Toulouse',
              typeAcces: 'Libre',
              etage: 'RDC',
              contraintes: 'Aucune'
            },
            sinistre: {
              type: 'Effraction',
              description: 'Porte d\'entrée forcée suite à cambriolage',
              urgence: 'elevee',
              dateSinistre: '2024-01-10',
              dateIntervention: '2024-01-12',
              numeroSinistre: 'SIN2024004'
            },
            mission: {
              titre: 'Réparation serrurerie',
              description: 'Remplacement de la serrure et réparation de la porte',
              budgetEstime: '320',
              delaiSouhaite: '1 jour',
              horaires: 'Urgence',
              materiaux: 'Fournis par le prestataire',
              normes: 'Normes serrurerie',
              conditionsParticulieres: 'Intervention urgente'
            },
            documents: []
          }
        ],
      },
    });
  }),

  graphql.query('GetMissionDetails', ({ variables }) => {
    const { missionId } = variables;
    return HttpResponse.json({
      data: {
        mission: {
          id: missionId,
          reference: 'M240001',
          titre: 'Réparation fuite salle de bain',
          status: 'En cours',
          statut: 'en_cours',
          dateCreation: '2024-01-15T10:00:00Z',
          dateModification: '2024-01-16T14:30:00Z',
          urgence: 'Élevée',
          budget: 1250,
          description: 'Réparation urgente de la fuite dans la salle de bain',
          societaire: {
            id: 'soc-1',
            nom: 'Jean Dupont',
            prenom: 'Jean',
            civilite: 'Monsieur',
            telephone: '0123456789',
            email: 'jean.dupont@email.com',
            adresse: '123 Rue de la Paix, 75001 Paris'
          },
          prestataire: {
            id: 'prest-1',
            nom: 'Marie Moreau',
            raisonSociale: 'MOREAU PLOMBERIE',
            companyName: 'MOREAU PLOMBERIE',
            ville: 'Paris',
            telephone: '0143234567',
            email: 'contact@moreau-plomberie.fr'
          },
          chantier: {
            adresse: '123 Rue de la Paix',
            codePostal: '75001',
            ville: 'Paris'
          },
          sinistre: {
            type: 'Dégât des eaux',
            description: 'Fuite importante dans la salle de bain'
          },
          lieuIntervention: '123 Rue de la Paix, 75001 Paris',
          documents: [
            { 
              id: 'doc-1', 
              fileName: 'photo_fuite.jpg', 
              url: '/uploads/photo_fuite.jpg',
              type: 'image',
              size: '2.1 MB',
              uploadDate: '2024-01-15T10:30:00Z'
            },
            { 
              id: 'doc-2', 
              fileName: 'devis_reparation.pdf', 
              url: '/uploads/devis_reparation.pdf',
              type: 'document',
              size: '156 KB',
              uploadDate: '2024-01-16T09:00:00Z'
            }
          ],
          historique: [
            { 
              id: 'hist-1', 
              date: '2024-01-15T10:00:00Z', 
              user: 'Assureur', 
              action: 'Création de la mission',
              description: 'Mission créée et assignée au prestataire'
            },
            { 
              id: 'hist-2', 
              date: '2024-01-16T11:30:00Z', 
              user: 'Prestataire', 
              action: 'Mission acceptée',
              description: 'Prise en charge confirmée par le prestataire'
            }
          ],
          commentaires: [
            {
              id: 'comm-1',
              auteur: 'Prestataire',
              message: 'Je peux intervenir dès demain matin. Merci de libérer l\'accès à la salle de bain.',
              date: '2024-01-16T12:00:00Z',
              type: 'prestataire'
            }
          ],
          messagesCount: 5,
          documentsCount: 2
        },
      },
    });
  }),

  graphql.mutation('CreateMission', ({ variables }) => {
    const { input } = variables;
    const newId = `M24${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    return HttpResponse.json({
      data: {
        createMission: {
          id: newId,
          reference: newId,
          titre: input?.mission?.titre || 'Nouvelle mission',
          status: 'Envoyée',
          statut: 'envoyee',
          urgence: input?.mission?.urgence || 'Moyenne',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString(),
          budget: input?.mission?.budget || 0,
          societaire: input?.client || {
            civilite: 'Monsieur',
            nom: 'Nouveau',
            prenom: 'Client',
            telephone: '0123456789'
          },
          prestataire: input?.prestataire || null,
          chantier: input?.chantier || {
            adresse: '',
            codePostal: '',
            ville: ''
          },
          sinistre: input?.sinistre || {
            type: 'Autre',
            description: ''
          },
          description: input?.mission?.description || 'Nouvelle mission créée',
          lieuIntervention: `${input?.chantier?.adresse || ''}, ${input?.chantier?.codePostal || ''} ${input?.chantier?.ville || ''}`.trim(),
          documentsCount: 0,
          messagesCount: 0,
          lastUpdate: new Date().toISOString()
        },
      },
    });
  }),

  // Intercept "AssureurLogin" GraphQL mutation.
  graphql.mutation('AssureurLogin', (req) => {
    const { email, password } = req.variables;

    if (email === 'assureur@test.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          assureurLogin: {
            tokens: {
              token: 'mock-assureur-jwt-token',
              refreshToken: 'mock-assureur-refresh-token',
              expiresIn: 3600,
            },
            user: {
              id: 'assureur-123',
              email: 'assureur@test.com',
              accountType: 'assureur',
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid assureur credentials',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      }, { status: 401 });
    }
  }),

  // Intercept "PrestataireLogin" GraphQL mutation.
  graphql.mutation('PrestataireLogin', (req) => {
    const { email, password } = req.variables;

    if (email === 'prestataire@test.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          prestataireLogin: {
            tokens: {
              token: 'mock-prestataire-jwt-token',
              refreshToken: 'mock-prestataire-refresh-token',
              expiresIn: 3600,
            },
            user: {
              id: 'prestataire-456',
              email: 'prestataire@test.com',
              accountType: 'prestataire',
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid prestataire credentials',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      }, { status: 401 });
    }
  }),

  // Intercept "SearchPrestataires" GraphQL query.
  graphql.query('SearchPrestataires', ({ variables }) => {
    const { location, specialty, name } = variables;
    
    // Mock data matching what tests expect
    let filteredPrestataires = [
      {
        id: '1',
        nom: 'Jean Dubois',
        raisonSociale: 'DUBOIS MAÇONNERIE SARL',
        siret: '12345678901234',
        formeJuridique: 'SARL',
        email: 'contact@dubois-maconnerie.fr',
        telephone: '0142123456',
        adresse: '123 Rue de la Paix',
        codePostal: '75001',
        ville: 'Paris',
        departement: '75 - Paris',
        region: 'Île-de-France',
        secteurs: ['Maçonnerie', 'Gros œuvre'],
        specialites: ['Murs porteurs', 'Fondations', 'Rénovation'],
        description: 'Entreprise spécialisée en maçonnerie générale avec 15 ans d\'expérience.',
        certifications: ['RGE', 'Qualibat'],
        documentsPublics: ['Kbis', 'Assurance décennale', 'Attestation fiscale'],
        notemoyenne: 4.5,
        nombreAvis: 23,
        dateCreation: '2010-05-15',
        avatar: null,
      },
      {
        id: '2',
        nom: 'Marie Moreau',
        raisonSociale: 'MOREAU PLOMBERIE',
        siret: '23456789012345',
        formeJuridique: 'EURL',
        email: 'contact@moreau-plomberie.fr',
        telephone: '0143234567',
        adresse: '456 Avenue des Champs',
        codePostal: '13001',
        ville: 'Marseille',
        departement: '13 - Bouches-du-Rhône',
        region: 'Provence-Alpes-Côte d\'Azur',
        secteurs: ['Plomberie', 'Chauffage'],
        specialites: ['Sanitaires', 'Réparations', 'Installation chauffage'],
        description: 'Plombier professionnel disponible 7j/7 pour urgences.',
        certifications: ['RGE', 'PG'],
        documentsPublics: ['Kbis', 'Assurance décennale'],
        notemoyenne: 4.8,
        nombreAvis: 41,
        dateCreation: '2015-03-10',
        avatar: null,
      },
      {
        id: '3',
        nom: 'Pierre Leroy',
        raisonSociale: 'LEROY ÉLECTRICITÉ',
        siret: '34567890123456',
        formeJuridique: 'SAS',
        email: 'contact@leroy-electricite.fr',
        telephone: '0144345678',
        adresse: '789 Boulevard Saint-Germain',
        codePostal: '31000',
        ville: 'Toulouse',
        departement: '31 - Haute-Garonne',
        region: 'Occitanie',
        secteurs: ['Électricité', 'Domotique'],
        specialites: ['Installation électrique', 'Mise aux normes', 'Domotique'],
        description: 'Électricien certifié pour tous types d\'installations.',
        certifications: ['Qualifelec', 'RGE'],
        documentsPublics: ['Kbis', 'Assurance décennale', 'Certificat Qualifelec'],
        notemoyenne: 4.2,
        nombreAvis: 18,
        dateCreation: '2018-09-20',
        avatar: null,
      }
    ];

    // Apply filters
    if (name) {
      filteredPrestataires = filteredPrestataires.filter(p => 
        p.nom.toLowerCase().includes(name.toLowerCase()) ||
        p.raisonSociale.toLowerCase().includes(name.toLowerCase()) ||
        p.secteurs.some(s => s.toLowerCase().includes(name.toLowerCase())) ||
        p.specialites.some(s => s.toLowerCase().includes(name.toLowerCase()))
      );
    }
    if (specialty) {
      filteredPrestataires = filteredPrestataires.filter(p => p.secteurs.includes(specialty));
    }
    if (location) {
      filteredPrestataires = filteredPrestataires.filter(p => 
        p.region === location || p.departement === location
      );
    }

    return HttpResponse.json({
      data: {
        searchPrestataires: filteredPrestataires,
      },
    });
  }),

  graphql.query('GetPrestataireMissions', () => {
    return HttpResponse.json({
      data: {
        getPrestataireMissions: mockMissions,
      },
    });
  }),

  graphql.mutation('UpdateMissionStatus', ({ variables }) => {
    const { missionId, status } = variables;
    
    // Find and update the mission in our mock data
    const missionIndex = mockMissions.findIndex(m => m.id === missionId);
    if (missionIndex !== -1) {
      mockMissions[missionIndex].missionStatus = status;
      
      return HttpResponse.json({
        data: {
          updateMissionStatus: {
            id: missionId,
            missionStatus: status,
          },
        },
      });
    }
    
    return HttpResponse.json({
      errors: [{ message: 'Mission not found' }],
    }, { status: 404 });
  }),

  graphql.mutation('SendComment', ({ variables }) => {
    const { missionId, content } = variables;
    return HttpResponse.json({
      data: {
        sendComment: {
          id: String(Math.random()),
          missionId,
          contenu: content,
          expediteur: 'prestataire',
          dateEnvoi: new Date().toISOString(),
          lu: true,
        },
      },
    });
  }),

  graphql.query('GetMessages', ({ variables }) => {
    const { missionId } = variables;
    return HttpResponse.json({
      data: {
        getMessages: [
          {
            id: '1',
            missionId,
            expediteur: 'assureur',
            contenu: 'Bonjour, pouvez-vous nous donner une estimation pour cette mission ?',
            dateEnvoi: new Date(Date.now() - 86400000).toISOString(),
            lu: true,
            fichiers: [],
          },
          {
            id: '2',
            missionId,
            expediteur: 'prestataire',
            contenu: 'Bonjour, je peux être sur place demain matin pour faire l\'évaluation.',
            dateEnvoi: new Date(Date.now() - 43200000).toISOString(),
            lu: true,
            fichiers: [],
          }
        ],
      },
    });
  }),

  // graphql.subscription('OnNewMessage', ({ variables }) => {
  //   // This is a mock subscription. In a real app, you'd use a WebSocket
  //   // to push messages to the client. Here, we'll just return an empty
  //   // stream to avoid errors.
  //   const stream = new ReadableStream({
  //     start(controller) {},
  //     cancel() {},
  //   });
  //   return HttpResponse.json({ data: stream });
  // }),

  // Intercept "DownloadDocument" GraphQL query.
  graphql.query('DownloadDocument', ({ variables }) => {
    const { documentName } = variables;
    return HttpResponse.json({
      data: {
        downloadDocument: {
          url: `/uploads/${documentName}`,
          filename: documentName,
          contentType: documentName.endsWith('.pdf') ? 'application/pdf' : 
                      documentName.endsWith('.jpg') || documentName.endsWith('.jpeg') ? 'image/jpeg' :
                      documentName.endsWith('.png') ? 'image/png' : 'application/octet-stream'
        },
      },
    });
  }),

  // Mock communication requests
  graphql.mutation('SendCommunicationRequest', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        sendCommunicationRequest: {
          id: `comm-${Math.random().toString(36).substring(7)}`,
          prestataireId: input.prestataireId,
          message: input.message,
          statut: 'en_attente',
          dateEnvoi: new Date().toISOString(),
        },
      },
    });
  }),

  graphql.query('GetCommunicationRequests', ({ request }) => {
    // Check if this is a test request asking for empty state
    const isEmptyStateTest = request.url.includes('empty') || request.headers.get('x-test-empty-state') === 'true';
    
    if (isEmptyStateTest) {
      return HttpResponse.json({
        data: {
          getCommunicationRequests: []
        }
      });
    }
    
    return HttpResponse.json({
      data: {
        getCommunicationRequests: [
          {
            id: 'comm-1',
            prestataire: {
              id: '1',
              nom: 'Jean Dubois',
              raisonSociale: 'DUBOIS MAÇONNERIE SARL',
              ville: 'Paris',
              telephone: '0142123456',
              email: 'contact@dubois-maconnerie.fr',
            },
            message: 'Bonjour, nous avons une mission urgente de réparation de fissures. Êtes-vous disponible cette semaine ?',
            statut: 'acceptee',
            dateEnvoi: '2024-01-15T10:00:00Z',
            dateReponse: '2024-01-15T14:30:00Z',
            reponseMessage: 'Bonjour, je suis disponible. Je peux me déplacer dès demain pour un devis.',
          },
          {
            id: 'comm-2',
            prestataire: {
              id: '2',
              nom: 'Marie Moreau',
              raisonSociale: 'MOREAU PLOMBERIE',
              ville: 'Marseille',
              telephone: '0143234567',
              email: 'contact@moreau-plomberie.fr',
            },
            message: 'Nous cherchons un plombier pour une intervention urgente de dégât des eaux.',
            statut: 'en_attente',
            dateEnvoi: '2024-01-16T11:00:00Z',
          },
          {
            id: 'comm-3',
            prestataire: {
              id: '3',
              nom: 'Pierre Leroy',
              raisonSociale: 'LEROY ÉLECTRICITÉ',
              ville: 'Toulouse',
              telephone: '0144345678',
              email: 'contact@leroy-electricite.fr',
            },
            message: 'Pourriez-vous nous faire un devis pour une remise aux normes électriques ?',
            statut: 'refusee',
            dateEnvoi: '2024-01-14T09:00:00Z',
            dateReponse: '2024-01-14T16:00:00Z',
            reponseMessage: 'Désolé, je suis complet jusqu\'à la fin du mois. Merci de votre compréhension.',
          },
        ],
      },
    });
  }),

  // Mock notifications
  graphql.query('GetNotifications', () => {
    return HttpResponse.json({
      data: {
        getNotifications: [
          {
            id: 'notif-1',
            type: 'mission_accepted',
            title: 'Mission acceptée',
            message: 'La mission REF-002 a été acceptée par Marie Moreau',
            date: '2024-01-16T15:30:00Z',
            read: false,
            data: { missionId: 'mission-2' },
          },
          {
            id: 'notif-2',
            type: 'communication_response',
            title: 'Réponse reçue',
            message: 'Jean Dubois a répondu à votre demande de communication',
            date: '2024-01-15T14:30:00Z',
            read: false,
            data: { communicationId: 'comm-1' },
          },
          {
            id: 'notif-3',
            type: 'new_message',
            title: 'Nouveau message',
            message: 'Nouveau message reçu pour la mission REF-001',
            date: '2024-01-15T10:15:00Z',
            read: true,
            data: { missionId: 'mission-1' },
          },
          {
            id: 'notif-4',
            type: 'mission_rejected',
            title: 'Mission refusée',
            message: 'La mission REF-003 a été refusée par Pierre Leroy',
            date: '2024-01-14T16:00:00Z',
            read: true,
            data: { missionId: 'mission-3' },
          },
        ],
      },
    });
  }),

  // Mock user notifications (for assureur)
  graphql.query('GetUserNotifications', () => {
    return HttpResponse.json({
      data: {
        getUserNotifications: [
          {
            id: 'notif-assureur-1',
            userId: 'user-assureur-1',
            notificationType: 'mission_accepted',
            title: 'Mission acceptée',
            message: 'La mission REF-002 a été acceptée par Marie Moreau',
            relatedEntityId: 'mission-2',
            relatedEntityType: 'mission',
            priority: 'HIGH',
            isRead: false,
            createdAt: '2024-01-16T15:30:00Z',
            expiresAt: null,
            actionUrl: '/missions/mission-2',
            metadata: []
          },
          {
            id: 'notif-assureur-2',
            userId: 'user-assureur-1',
            notificationType: 'mission_completed',
            title: 'Mission terminée',
            message: 'La mission REF-001 a été terminée par Pierre Dubois',
            relatedEntityId: 'mission-1',
            relatedEntityType: 'mission',
            priority: 'MEDIUM',
            isRead: false,
            createdAt: '2024-01-16T12:00:00Z',
            expiresAt: null,
            actionUrl: '/missions/mission-1',
            metadata: []
          },
          {
            id: 'notif-assureur-3',
            userId: 'user-assureur-1',
            notificationType: 'communication_response',
            title: 'Réponse reçue',
            message: 'Jean Dubois a répondu à votre demande de communication',
            relatedEntityId: 'comm-1',
            relatedEntityType: 'communication',
            priority: 'MEDIUM',
            isRead: false,
            createdAt: '2024-01-15T14:30:00Z',
            expiresAt: null,
            actionUrl: '/communications/comm-1',
            metadata: []
          },
        ],
      },
    });
  }),

  graphql.mutation('MarkNotificationRead', ({ variables }) => {
    const { notificationId } = variables;
    return HttpResponse.json({
      data: {
        markNotificationRead: {
          id: notificationId,
          read: true,
        },
      },
    });
  }),

  // Mock export functionality
  graphql.query('ExportMissions', ({ variables }) => {
    const { filters, format } = variables;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `missions-export-${timestamp}.${format}`;
    
    return HttpResponse.json({
      data: {
        exportMissions: {
          url: `/exports/${filename}`,
          filename: filename,
          contentType: format === 'pdf' ? 'application/pdf' : 
                      format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                      'text/csv',
        },
      },
    });
  }),

  graphql.query('ExportMissionDetails', ({ variables }) => {
    const { missionId, format } = variables;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `mission-${missionId}-${timestamp}.${format}`;
    
    return HttpResponse.json({
      data: {
        exportMissionDetails: {
          url: `/exports/${filename}`,
          filename: filename,
          contentType: format === 'pdf' ? 'application/pdf' : 
                      format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                      'text/csv',
        },
      },
    });
  }),

  // Prestataire notifications
  graphql.query('GetPrestataireNotifications', () => {
    return HttpResponse.json({
      data: {
        getPrestataireNotifications: [
          {
            id: 'notif-p1',
            userId: 'user-prestataire-1',
            notificationType: 'new_mission',
            title: 'Nouvelle mission',
            message: 'Une nouvelle mission vous a été assignée: Réparation plomberie',
            relatedEntityId: 'mission-1',
            relatedEntityType: 'mission',
            priority: 'HIGH',
            isRead: false,
            createdAt: '2024-01-16T10:30:00Z',
            expiresAt: null,
            actionUrl: '/missions/mission-1',
            metadata: []
          },
          {
            id: 'notif-p2',
            userId: 'user-prestataire-1',
            notificationType: 'communication_request',
            title: 'Demande de communication',
            message: 'Assurance Alpha souhaite vous contacter',
            relatedEntityId: 'assureur-1',
            relatedEntityType: 'assureur',
            priority: 'MEDIUM',
            isRead: false,
            createdAt: '2024-01-15T16:00:00Z',
            expiresAt: null,
            actionUrl: '/communications/assureur-1',
            metadata: []
          },
          {
            id: 'notif-p3',
            userId: 'user-prestataire-1',
            notificationType: 'payment_received',
            title: 'Paiement reçu',
            message: 'Paiement de 850€ reçu pour la mission REF-001',
            relatedEntityId: 'mission-1',
            relatedEntityType: 'mission',
            priority: 'LOW',
            isRead: true,
            createdAt: '2024-01-14T12:00:00Z',
            expiresAt: null,
            actionUrl: '/missions/mission-1',
            metadata: []
          },
          {
            id: 'notif-p4',
            userId: 'user-prestataire-1',
            notificationType: 'review_received',
            title: 'Nouvel avis',
            message: 'Vous avez reçu une note de 5/5 étoiles',
            relatedEntityId: 'review-1',
            relatedEntityType: 'review',
            priority: 'LOW',
            isRead: true,
            createdAt: '2024-01-13T14:20:00Z',
            expiresAt: null,
            actionUrl: '/reviews/review-1',
            metadata: []
          },
        ],
      },
    });
  }),

  graphql.mutation('MarkPrestataireNotificationRead', ({ variables }) => {
    const { notificationId } = variables;
    return HttpResponse.json({
      data: {
        markPrestataireNotificationRead: {
          id: notificationId,
          read: true,
        },
      },
    });
  }),

  // Communication requests for prestataire
  graphql.query('GetCommunicationRequestsForPrestataire', () => {
    return HttpResponse.json({
      data: {
        getCommunicationRequestsForPrestataire: [
          {
            id: 'comm-p1',
            assureur: {
              id: 'assureur-1',
              companyName: 'Assurance Alpha',
              email: 'contact@alpha-assurance.fr',
              phone: '01 42 12 34 56',
            },
            message: 'Nous avons une mission urgente de plomberie. Êtes-vous disponible cette semaine pour un dépannage ?',
            statut: 'en_attente',
            dateEnvoi: '2024-01-16T09:00:00Z',
          },
          {
            id: 'comm-p2',
            assureur: {
              id: 'assureur-2',
              companyName: 'Assurance Beta',
              email: 'contact@beta-assurance.fr',
              phone: '01 43 23 45 67',
            },
            message: 'Pouvez-vous nous envoyer un devis pour la rénovation d\'une salle de bain suite à dégât des eaux ?',
            statut: 'acceptee',
            dateEnvoi: '2024-01-15T14:30:00Z',
            dateReponse: '2024-01-15T16:00:00Z',
            reponseMessage: 'Bonjour, je suis disponible. Je peux faire le déplacement demain pour établir un devis détaillé.',
          },
          {
            id: 'comm-p3',
            assureur: {
              id: 'assureur-3',
              companyName: 'Assurance Gamma',
              email: 'contact@gamma-assurance.fr',
              phone: '01 44 34 56 78',
            },
            message: 'Nous cherchons un plombier pour des interventions régulières. Quel est votre secteur d\'intervention ?',
            statut: 'refusee',
            dateEnvoi: '2024-01-12T11:00:00Z',
            dateReponse: '2024-01-12T15:30:00Z',
            reponseMessage: 'Merci pour votre demande. Malheureusement, votre secteur est trop éloigné de ma zone d\'intervention.',
          },
        ],
      },
    });
  }),

  graphql.mutation('RespondToCommunicationRequest', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        respondToCommunicationRequest: {
          id: input.requestId,
          statut: input.statut,
          dateReponse: new Date().toISOString(),
          reponseMessage: input.reponseMessage,
        },
      },
    });
  }),

  // Prestataire statistics
  graphql.query('GetPrestataireStatistics', () => {
    return HttpResponse.json({
      data: {
        getPrestataireStatistics: {
          totalMissions: 47,
          completedMissions: 42,
          pendingMissions: 3,
          acceptanceRate: 0.89,
          averageRating: 4.6,
          totalEarnings: 23450,
          monthlyEarnings: 3200,
          missionsThisMonth: 8,
          missionsThisWeek: 2,
          upcomingMissions: 3,
          overduePayments: 1,
        },
      },
    });
  }),

  // Export functionality for prestataire
  graphql.query('ExportPrestataireMissions', ({ variables }) => {
    const { filters, format } = variables;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `prestataire-missions-${timestamp}.${format}`;
    
    return HttpResponse.json({
      data: {
        exportPrestataireMissions: {
          url: `/exports/${filename}`,
          filename: filename,
          contentType: format === 'pdf' ? 'application/pdf' : 
                      format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                      'text/csv',
        },
      },
    });
  }),

  graphql.query('ExportPrestataireReport', ({ variables }) => {
    const { period, format } = variables;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `prestataire-report-${period}-${timestamp}.${format}`;
    
    return HttpResponse.json({
      data: {
        exportPrestataireReport: {
          url: `/exports/${filename}`,
          filename: filename,
          contentType: format === 'pdf' ? 'application/pdf' : 
                      format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                      'text/csv',
        },
      },
    });
  }),

  // Profile management
  graphql.mutation('UpdatePrestataireProfile', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        updatePrestataireProfile: {
          id: 'prestataire-123',
          companyInfo: {
            raisonSociale: 'MOREAU PLOMBERIE SARL',
            siret: '12345678901234',
            adresse: input.companyInfo?.adresse || '456 Avenue des Champs',
            codePostal: input.companyInfo?.codePostal || '13001',
            ville: input.companyInfo?.ville || 'Marseille',
            telephone: input.companyInfo?.telephone || '04 91 23 45 67',
            email: input.companyInfo?.email || 'contact@moreau-plomberie.fr',
          },
          sectors: input.sectors || ['Plomberie', 'Chauffage'],
          specialties: input.specialties || ['Sanitaires', 'Réparations', 'Installation chauffage'],
          description: input.description || 'Plombier professionnel disponible 7j/7 pour urgences.',
          serviceRadius: input.serviceRadius || 50,
          hourlyRate: input.hourlyRate || 45,
          availabilityStatus: 'available',
        },
      },
    });
  }),

  graphql.mutation('UpdatePrestataireAvailability', ({ variables }) => {
    const { status } = variables;
    return HttpResponse.json({
      data: {
        updatePrestataireAvailability: {
          id: 'prestataire-123',
          availabilityStatus: status,
        },
      },
    });
  }),

  // Enhanced file upload
  graphql.mutation('SendFileWithMessage', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        sendFileWithMessage: {
          id: `msg-${Math.random().toString(36).substring(7)}`,
          missionId: input.missionId,
          expediteur: 'prestataire',
          contenu: input.contenu || 'Fichier envoyé',
          dateEnvoi: new Date().toISOString(),
          fichiers: input.files.map((file: any, index: number) => ({
            id: `file-${index}`,
            fileName: file.name,
            url: `/uploads/${file.name}`,
            contentType: file.type,
            size: file.size,
          })),
          lu: false,
        },
      },
    });
  }),

  graphql.mutation('UploadMissionDocument', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        uploadMissionDocument: {
          id: `doc-${Math.random().toString(36).substring(7)}`,
          fileName: input.file.name,
          url: `/uploads/mission-docs/${input.file.name}`,
          contentType: input.file.type,
          size: input.file.size,
          uploadDate: new Date().toISOString(),
          description: input.description,
          category: input.category,
        },
      },
    });
  }),

  // ===== SOCIETAIRE NEW FUNCTIONALITY =====

  // Societaire Notifications
  graphql.query('GetSocietaireNotifications', ({ variables }) => {
    return HttpResponse.json({
      data: {
        getSocietaireNotifications: [
          {
            id: 'notif-soc-1',
            userId: 'user-societaire-1',
            notificationType: 'timeline_update',
            title: 'Mise à jour de votre dossier',
            message: 'L\'expertise a été réalisée. Rapport disponible dans vos documents.',
            relatedEntityId: 'DOS-2024-001',
            relatedEntityType: 'dossier',
            priority: 'HIGH',
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            expiresAt: null,
            actionUrl: '/societaire-dashboard',
            metadata: []
          },
          {
            id: 'notif-soc-2',
            type: 'message',
            title: 'Nouveau message',
            message: 'Votre prestataire a ajouté un commentaire sur votre dossier.',
            relatedEntityId: 'DOS-2024-001',
            relatedEntityType: 'dossier',
            priority: 'medium',
            isRead: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            expiresAt: null,
            actionUrl: '/societaire-dashboard',
            metadata: []
          },
          {
            id: 'notif-soc-3',
            type: 'document',
            title: 'Nouveau document',
            message: 'Un nouveau document a été ajouté à votre dossier.',
            relatedEntityId: 'DOS-2024-001',
            relatedEntityType: 'dossier',
            priority: 'low',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: null,
            actionUrl: '/societaire-dashboard',
            metadata: []
          }
        ]
      }
    });
  }),

  // Mark Societaire Notification Read
  graphql.mutation('MarkSocietaireNotificationRead', ({ variables }) => {
    return HttpResponse.json({
      data: {
        markSocietaireNotificationRead: {
          id: variables.notificationId,
          isRead: true,
          readAt: new Date().toISOString()
        }
      }
    });
  }),

  // Societaire Messages
  graphql.query('GetSocietaireMessages', ({ variables }) => {
    return HttpResponse.json({
      data: {
        getSocietaireMessages: {
          messages: [
            {
              id: 'msg-soc-1',
              dossierNumber: 'DOS-2024-001',
              expediteur: 'assureur',
              destinataire: 'societaire',
              contenu: 'Bonjour, nous avons bien reçu votre déclaration. Un expert sera mandaté rapidement.',
              dateEnvoi: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              lu: true,
              type: 'text',
              fichiers: [],
              metadata: []
            },
            {
              id: 'msg-soc-2',
              dossierNumber: 'DOS-2024-001',
              expediteur: 'societaire',
              destinataire: 'prestataire',
              contenu: 'Voici les photos complémentaires demandées.',
              dateEnvoi: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              lu: true,
              type: 'text',
              fichiers: [
                {
                  id: 'file-soc-1',
                  fileName: 'photo_degats_detail.jpg',
                  url: '/uploads/societaire/photo_degats_detail.jpg',
                  contentType: 'image/jpeg',
                  size: 1024000
                }
              ],
              metadata: []
            },
            {
              id: 'msg-soc-3',
              dossierNumber: 'DOS-2024-001',
              expediteur: 'prestataire',
              destinataire: 'societaire',
              contenu: 'Expertise terminée. Le rapport détaillé sera disponible sous 48h.',
              dateEnvoi: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              lu: false,
              type: 'text',
              fichiers: [],
              metadata: []
            }
          ],
          totalCount: 3,
          hasMore: false
        }
      }
    });
  }),

  // Send Societaire Message
  graphql.mutation('SendSocietaireMessage', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        sendSocietaireMessage: {
          id: `msg-soc-${Math.random().toString(36).substring(7)}`,
          dossierNumber: input.dossierNumber,
          expediteur: 'societaire',
          destinataire: input.destinataire || 'prestataire',
          contenu: input.contenu,
          dateEnvoi: new Date().toISOString(),
          lu: false,
          type: input.type || 'text',
          fichiers: input.fichiers || [],
          metadata: input.metadata || []
        }
      }
    });
  }),

  // Upload Societaire Document
  graphql.mutation('UploadSocietaireDocument', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        uploadSocietaireDocument: {
          id: `doc-soc-${Math.random().toString(36).substring(7)}`,
          dossierNumber: input.dossierNumber,
          fileName: `uploaded_${Date.now()}.pdf`,
          originalName: input.originalName || 'document.pdf',
          url: `/uploads/societaire/uploaded_${Date.now()}.pdf`,
          contentType: input.contentType || 'application/pdf',
          size: input.size || 1024000,
          category: input.category || 'evidence',
          description: input.description || 'Document uploadé par le sociétaire',
          uploadDate: new Date().toISOString(),
          uploadedBy: 'societaire',
          status: 'active',
          metadata: input.metadata || []
        }
      }
    });
  }),

  // Get Societaire Documents
  graphql.query('GetSocietaireDocuments', ({ variables }) => {
    return HttpResponse.json({
      data: {
        getSocietaireDocuments: {
          documents: [
            {
              id: 'doc-soc-1',
              dossierNumber: variables.dossierNumber,
              fileName: 'rapport_expertise.pdf',
              originalName: 'rapport_expertise.pdf',
              url: '/uploads/societaire/rapport_expertise.pdf',
              contentType: 'application/pdf',
              size: 2048000,
              category: 'report',
              description: 'Rapport d\'expertise officiel',
              uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              uploadedBy: 'expert',
              status: 'active',
              downloadCount: 2,
              lastDownloadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              metadata: []
            },
            {
              id: 'doc-soc-2',
              dossierNumber: variables.dossierNumber,
              fileName: 'devis_reparation.pdf',
              originalName: 'devis_reparation.pdf',
              url: '/uploads/societaire/devis_reparation.pdf',
              contentType: 'application/pdf',
              size: 512000,
              category: 'quote',
              description: 'Devis de réparation du prestataire',
              uploadDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              uploadedBy: 'prestataire',
              status: 'active',
              downloadCount: 1,
              lastDownloadDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              metadata: []
            }
          ],
          totalCount: 2,
          hasMore: false,
          categories: ['report', 'quote', 'evidence', 'correspondence']
        }
      }
    });
  }),

  // Update Societaire Claim Status
  graphql.mutation('UpdateSocietaireClaimStatus', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        updateSocietaireClaimStatus: {
          id: `status-update-${Math.random().toString(36).substring(7)}`,
          dossierNumber: input.dossierNumber,
          newStatus: input.newStatus,
          previousStatus: input.previousStatus || 'En attente',
          comment: input.comment || 'Statut mis à jour',
          updatedBy: 'societaire',
          updatedAt: new Date().toISOString(),
          timeline: [
            {
              id: 'timeline-1',
              date: '15/01/2024',
              status: 'Terminé',
              description: 'Déclaration du sinistre',
              updatedBy: 'societaire',
              comment: null
            },
            {
              id: 'timeline-2',
              date: '16/01/2024',
              status: 'Terminé',
              description: 'Assignation d\'un expert',
              updatedBy: 'assureur',
              comment: null
            },
            {
              id: 'timeline-3',
              date: '17/01/2024',
              status: input.newStatus,
              description: 'Visite d\'expertise',
              updatedBy: 'expert',
              comment: input.comment || 'Statut mis à jour'
            }
          ]
        }
      }
    });
  }),

  // Export Societaire Data
  graphql.query('ExportSocietaireData', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        exportSocietaireData: {
          url: `/exports/societaire-export-${input.dossierNumber}.pdf`,
          filename: `dossier-${input.dossierNumber}-export.pdf`,
          contentType: 'application/pdf',
          size: 1024000,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          downloadCount: 0,
          maxDownloads: 5
        }
      }
    });
  }),

  // Get Societaire Profile
  graphql.query('GetSocietaireProfile', ({ variables }) => {
    return HttpResponse.json({
      data: {
        getSocietaireProfile: {
          id: 'societaire-1',
          email: 'jean.dupont@email.com',
          dossierNumber: variables.dossierNumber,
          personalInfo: {
            firstName: 'Jean',
            lastName: 'Dupont',
            dateOfBirth: '1985-03-15',
            address: {
              street: '123 Rue de la République',
              city: 'Paris',
              postalCode: '75011',
              country: 'France'
            },
            phone: '06 12 34 56 78',
            emergencyContact: {
              name: 'Marie Dupont',
              phone: '06 98 76 54 32',
              relationship: 'Épouse'
            }
          },
          preferences: {
            language: 'fr',
            timezone: 'Europe/Paris',
            notificationSettings: {
              email: true,
              sms: false,
              push: true,
              categories: ['timeline_update', 'message', 'document']
            },
            communicationPreferences: {
              preferredMethod: 'email',
              availableHours: '09:00-18:00'
            }
          },
          policyInfo: {
            policyNumber: 'POL-2023-789',
            coverageType: 'Habitation',
            startDate: '2023-01-01',
            endDate: '2024-01-01',
            deductible: 150,
            coverageLimit: 100000
          },
          accountStatus: 'active',
          lastLoginDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        }
      }
    });
  }),

  // Update Societaire Profile
  graphql.mutation('UpdateSocietaireProfile', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        updateSocietaireProfile: {
          id: 'societaire-1',
          email: input.email || 'jean.dupont@email.com',
          dossierNumber: input.dossierNumber,
          personalInfo: input.personalInfo || {
            firstName: 'Jean',
            lastName: 'Dupont',
            dateOfBirth: '1985-03-15',
            address: {
              street: '123 Rue de la République',
              city: 'Paris',
              postalCode: '75011',
              country: 'France'
            },
            phone: '06 12 34 56 78',
            emergencyContact: {
              name: 'Marie Dupont',
              phone: '06 98 76 54 32',
              relationship: 'Épouse'
            }
          },
          preferences: input.preferences || {
            language: 'fr',
            timezone: 'Europe/Paris',
            notificationSettings: {
              email: true,
              sms: false,
              push: true,
              categories: ['timeline_update', 'message', 'document']
            },
            communicationPreferences: {
              preferredMethod: 'email',
              availableHours: '09:00-18:00'
            }
          },
          accountStatus: 'active',
          updatedAt: new Date().toISOString()
        }
      }
    });
  }),

  // Search Societaire History
  graphql.query('SearchSocietaireHistory', ({ variables }) => {
    const { input } = variables;
    return HttpResponse.json({
      data: {
        searchSocietaireHistory: {
          results: [
            {
              id: 'history-1',
              dossierNumber: input.dossierNumber,
              type: 'message',
              title: 'Message de l\'assureur',
              description: 'Confirmation de prise en charge du dossier',
              date: '15/01/2024',
              author: 'Sophie Durand',
              category: 'communication',
              tags: ['prise-en-charge', 'confirmation'],
              relatedEntities: [],
              attachments: [],
              metadata: []
            },
            {
              id: 'history-2',
              dossierNumber: input.dossierNumber,
              type: 'document',
              title: 'Rapport d\'expertise',
              description: 'Document ajouté par l\'expert',
              date: '17/01/2024',
              author: 'Expert BERNARD',
              category: 'expertise',
              tags: ['rapport', 'expertise'],
              relatedEntities: [],
              attachments: [
                {
                  id: 'attach-1',
                  fileName: 'rapport_expertise.pdf',
                  url: '/uploads/rapport_expertise.pdf',
                  contentType: 'application/pdf'
                }
              ],
              metadata: []
            }
          ],
          totalCount: 2,
          hasMore: false,
          filters: {
            categories: ['communication', 'expertise', 'travaux'],
            authors: ['Sophie Durand', 'Expert BERNARD', 'Jean Dupont'],
            dateRange: {
              min: '2024-01-01',
              max: '2024-01-31'
            },
            tags: ['prise-en-charge', 'confirmation', 'rapport', 'expertise']
          },
          searchTerm: input.searchTerm || '',
          appliedFilters: input.filters || {}
        }
      }
    });
  }),

  // File Upload Mutations with actual file content
  graphql.mutation('UploadSocietaireFile', ({ variables }) => {
    const { input } = variables;
    
    return HttpResponse.json({
      data: {
        uploadSocietaireFile: {
          id: `doc-${Date.now()}`,
          dossierNumber: input.dossierNumber,
          filename: `uploaded-${Date.now()}.pdf`,
          originalName: input.file?.name || 'document.pdf',
          url: `/uploads/societaire/${input.dossierNumber}/${Date.now()}.pdf`,
          contentType: input.file?.type || 'application/pdf',
          size: input.file?.size || 1024000,
          category: input.category,
          description: input.description || '',
          uploadDate: new Date().toISOString(),
          uploadedBy: 'user-societaire-1',
          status: 'uploaded',
          metadata: {
            originalFilename: input.file?.name || 'document.pdf',
            uploadMethod: 'graphql-multipart'
          }
        }
      }
    });
  }),

  graphql.mutation('UploadMissionFile', ({ variables }) => {
    const { input } = variables;
    
    return HttpResponse.json({
      data: {
        uploadMissionFile: {
          id: `mission-doc-${Date.now()}`,
          filename: `mission-${Date.now()}.pdf`,
          url: `/uploads/missions/${input.missionId}/${Date.now()}.pdf`,
          contentType: input.file?.type || 'application/pdf',
          size: input.file?.size || 1024000,
          uploadDate: new Date().toISOString(),
          description: input.description || '',
          uploadedBy: 'user-prestataire-1'
        }
      }
    });
  }),

  graphql.mutation('UploadFile', ({ variables }) => {
    const { input } = variables;
    
    return HttpResponse.json({
      data: {
        uploadFile: {
          id: `file-${Date.now()}`,
          ownerId: 'user-123',
          relatedEntityId: null,
          relatedEntityType: null,
          filename: `upload-${Date.now()}.pdf`,
          originalFilename: input.filename,
          fileType: input.contentType,
          fileSize: input.file?.size || 1024000,
          storagePath: `/uploads/general/${Date.now()}.pdf`,
          documentType: 'AUTRE',
          uploadedAt: new Date().toISOString(),
          isPublic: false,
          metadata: {
            category: input.category,
            description: input.description,
            uploadMethod: 'graphql-upload'
          }
        }
      }
    });
  }),

  // Additional handlers for missing test functionality
  
  // Handle file upload simulation for tests  
  http.post('/uploads/*', () => {
    return HttpResponse.json({
      success: true,
      filename: 'test-file.pdf',
      url: '/uploads/test-file.pdf'
    });
  }),

  // Handle download simulation for tests
  http.get('/exports/*', () => {
    return new HttpResponse(new Blob(['Mock PDF content'], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="export.pdf"'
      }
    });
  }),
];