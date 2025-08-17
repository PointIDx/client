
import { gql } from 'graphql-tag'

export const GET_MISSION_DETAILS_QUERY = gql`
  query GetMissionDetails($missionId: UUID!) {
    getMissionDetails(missionId: $missionId) {
      id
      reference
      status
      dateDeCreation
      urgence
      description
      estimatedCost
      actualCost
      deadline
      
      # Client information
      civilite
      nom
      prenom
      telephone
      email
      adresse
      codePostal
      ville
      
      # Site/Worksite information
      chantierAdresse
      chantierCodePostal
      chantierVille
      chantierTypeAcces
      chantierEtage
      chantierContraintes
      chantierMemeAdresseClient
      
      # Incident information
      sinistreType
      sinistreDescription
      sinistreUrgence
      sinistreDateSinistre
      sinistreDateIntervention
      numeroSinistre
      
      # Mission information
      titre
      budgetEstime
      delaiSouhaite
      horaires
      materiaux
      normes
      conditionsParticulieres
      
      # Communication preferences
      emailClient
      smsClient
      creerAccesClient
      
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
      location {
        street
        city
        postalCode
        country
      }
    }
  }
`
