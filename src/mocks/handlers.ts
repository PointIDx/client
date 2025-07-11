import { graphql, HttpResponse, http } from 'msw'

export const handlers = [
  // Mock SIRET API
  http.get('/api/siret/:siret', ({ params }) => {
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

    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          login: {
            token: 'mock-jwt-token',
            user: {
              id: 'user-123',
              email: 'test@example.com',
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
            token: 'mock-jwt-token-new-user',
            user: {
              id: 'new-user-456',
              email: email,
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

  // Intercept "AssureurSignup" GraphQL mutation.
  graphql.mutation('AssureurSignup', (req) => {
    const { companyInfo, documents, contact, insurerInfo, account } = req.variables;

    if (companyInfo && documents && contact && insurerInfo && account) {
      return HttpResponse.json({
        data: {
          assureurSignup: {
            token: 'mock-assureur-jwt-token',
            expiresIn: 3600,
            refreshToken: 'mock-assureur-refresh-token',
            user: {
              id: 'assureur-789',
              email: account.email,
              accountType: 'assureur',
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

    if (email === 'societaire@example.com' && dossierNumber === 'DOSSIER123') {
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

  // Intercept "SendComment" GraphQL mutation.
  graphql.mutation('SendComment', (req) => {
    const { dossierNumber, comment } = req.variables;

    if (dossierNumber && comment) {
      return HttpResponse.json({
        data: {
          sendComment: {
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

  // Intercept "SearchPrestataires" GraphQL query.
  graphql.query('SearchPrestataires', ({ variables }) => {
    const { location, specialty, name } = variables;
    
    // Simulate filtering logic
    let filteredPrestataires = [
      {
        id: '1',
        companyName: 'Plomberie Express',
        contactPerson: 'Jean Dupont',
        email: 'jean.dupont@plomberie-express.com',
        phone: '0123456789',
        address: '123 Rue de la Plomberie, Paris',
        specialties: ['Plomberie', 'Chauffage'],
      },
      {
        id: '2',
        companyName: 'Electricité Rapide',
        contactPerson: 'Marie Curie',
        email: 'marie.curie@electricite-rapide.com',
        phone: '0987654321',
        address: "456 Avenue de l'Electricité, Lyon",
        specialties: ['Electricité', 'Domotique'],
      },
      {
        id: '3',
        companyName: 'Serrurerie Sécurité',
        contactPerson: 'Paul Lefevre',
        email: 'paul.lefevre@serrurerie-securite.com',
        phone: '0112233445',
        address: '789 Boulevard de la Serrurerie, Marseille',
        specialties: ['Serrurerie'],
      },
    ];

    if (location) {
      filteredPrestataires = filteredPrestataires.filter(p => p.address.toLowerCase().includes(location.toLowerCase()));
    }
    if (specialty) {
      filteredPrestataires = filteredPrestataires.filter(p => p.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase())));
    }
    if (name) {
      filteredPrestataires = filteredPrestataires.filter(p => p.companyName.toLowerCase().includes(name.toLowerCase()) || p.contactPerson.toLowerCase().includes(name.toLowerCase()));
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
        getPrestataireMissions: [
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
        ],
      },
    });
  }),

  graphql.mutation('UpdateMissionStatus', ({ variables }) => {
    const { missionId, status } = variables;
    return HttpResponse.json({
      data: {
        updateMissionStatus: {
          id: missionId,
          missionStatus: status,
        },
      },
    });
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
];