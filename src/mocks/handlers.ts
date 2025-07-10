import { graphql, HttpResponse } from 'msw'

export const handlers = [
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
    const { dossierNumber, file, comment } = req.variables;

    if (dossierNumber && file) {
      return HttpResponse.json({
        data: {
          sendFile: {
            success: true,
            message: 'File uploaded successfully',
            document: {
              nom: file.name,
              type: file.type.startsWith('image/') ? 'image' : 'document',
              taille: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
              auteur: 'Client',
              date: new Date().toLocaleDateString('fr-FR'),
            },
            historiqueItem: {
              auteur: 'Client',
              message: comment || `Fichier ${file.name} ajouté.`, 
              date: new Date().toLocaleString('fr-FR'),
              type: 'client',
              fichiers: [file.name],
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Missing dossier number or file',
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
];