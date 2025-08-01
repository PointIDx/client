import { gql } from 'graphql-tag';

export const GET_ASSUREUR_MISSIONS_ENHANCED_QUERY = gql`
  query GetAssureurMissionsEnhanced {
    getAssureurMissionsEnhanced {
      id
      reference
      status
      dateDeCreation
      urgence
      description
      societaire {
        id
        dossierNumber
        firstName
        lastName
        phone
        email
      }
      prestataire {
        id
        companyName
        contactPerson
        phone
        email
      }
      documents {
        id
        filename
        url
        contentType
        size
        uploadDate
        description
        uploadedBy
      }
      historique {
        id
        entityType
        entityId
        action
        oldValue
        newValue
        userId
        timestamp
        ipAddress
        userAgent
      }
      commentaires {
        id
        missionId
        userId
        expediteur
        contenu
        dateEnvoi
        lu
        createdAt
      }
      estimatedCost
      actualCost
      location {
        street
        city
        postalCode
        country
      }
      deadline
    }
  }
`;