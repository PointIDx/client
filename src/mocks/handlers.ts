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
  // Mock SIRET API
  http.get('https://api.insee.fr/entreprises/sirene/V3/siret/:siret', ({ params }) => {
    const { siret } = params;
    if (siret === '12345678901234') {
      return HttpResponse.json({
        etablissement: {
          uniteLegale: {
            denominationUniteLegale: "ASSURANCE TEST SA",
            categorieJuridiqueUniteLegale: "5499",
          },
          adresseEtablissement: {
            numeroVoieEtablissement: "10",
            typeVoieEtablissement: "RUE",
            libelleVoieEtablissement: "DE LA PAIX",
            codePostalEtablissement: "75001",
            libelleCommuneEtablissement: "PARIS",
          },
          dateCreationEtablissement: "2020-01-01",
        },
      });
    } else {
      return HttpResponse.json({
        message: "SIRET non trouvé ou invalide",
      }, { status: 404 });
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
    const { email, password } = req.variables;

    // Assureur login
    if (email === 'assureur@test.com' && password === 'password123') {
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
              type: 'assureur',
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
    else if (email === 'prestataire@test.com' && password === 'password123') {
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
    else if (email === 'test@example.com' && password === 'password123') {
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
            id: 'mission-1',
            reference: 'REF-001',
            status: 'En attente de prestataire',
            societaire: { id: 'soc-1', name: 'Jean Dupont', address: '123 Rue A' },
            prestataire: null,
            dateDeCreation: '2024-01-15T10:00:00Z',
          },
          {
            id: 'mission-2',
            reference: 'REF-002',
            status: 'En cours',
            societaire: { id: 'soc-2', name: 'Marie Durand', address: '456 Avenue B' },
            prestataire: { id: 'prest-1', companyName: 'Plomberie Express' },
            dateDeCreation: '2024-01-16T11:00:00Z',
          },
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
          reference: 'REF-001',
          status: 'En attente de prestataire',
          dateDeCreation: '2024-01-15T10:00:00Z',
          urgence: 'Haute',
          description: 'Grosse fuite d\'eau dans la salle de bain.',
          societaire: {
            id: 'soc-1',
            name: 'Jean Dupont',
            address: '123 Rue A, 75001 Paris',
            phone: '0123456789',
            email: 'jean.dupont@email.com',
          },
          prestataire: null,
          documents: [{ id: 'doc-1', fileName: 'photo_fuite.jpg', url: '/uploads/photo_fuite.jpg' }],
          historique: [{ id: 'hist-1', date: '2024-01-15T10:00:00Z', user: 'Assureur', action: 'Création de la mission' }],
          commentaires: [],
        },
      },
    });
  }),

  graphql.mutation('CreateMission', () => {
    return HttpResponse.json({
      data: {
        createMission: {
          id: `mission-${Math.random().toString(36).substring(7)}`,
          reference: `REF-${Math.random().toString(36).substring(7)}`,
          status: 'En attente de prestataire',
          dateDeCreation: new Date().toISOString(),
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
          },
          {
            id: '2',
            missionId,
            expediteur: 'prestataire',
            contenu: 'Bonjour, je peux être sur place demain matin pour faire l\'évaluation.',
            dateEnvoi: new Date(Date.now() - 43200000).toISOString(),
            lu: true,
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
];