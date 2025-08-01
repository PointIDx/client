import { gql } from '@apollo/client/core'

export const VALIDATE_SIRET_QUERY = gql`
  query ValidateSiret($siret: String!) {
    validateSiret(siret: $siret) {
      isValid
      companyInfo {
        siret
        raisonSociale
        formeJuridique
        adresse
        codePostal
        ville
        pays
        dateCreation
      }
      error
    }
  }
`