import { gql } from 'graphql-tag';

export const ASSUREUR_SIGNUP_MUTATION = gql`
  mutation AssureurSignup(
    $companyInfo: CompanyInfoInput!,
    $documents: DocumentsInput!,
    $contact: ContactInput!,
    $insurerInfo: InsurerInfoInput!,
    $account: AccountInput!
  ) {
    assureurSignup(
      companyInfo: $companyInfo,
      documents: $documents,
      contact: $contact,
      insurerInfo: $insurerInfo,
      account: $account
    ) {
      token
      expiresIn
      refreshToken
      user {
        id
        email
        accountType
      }
    }
  }

  input CompanyInfoInput {
    raisonSociale: String!
    siret: String!
    formeJuridique: String!
    adresse: String!
    codePostal: String!
    ville: String!
    pays: String!
    dateCreation: String!
  }

  input DocumentsInput {
    kbis: Upload!
    assurance: Upload!
    agrement: Upload!
  }

  input ContactInput {
    prenom: String!
    nom: String!
    email: String!
    telephone: String!
  }

  input InsurerInfoInput {
    numeroAgrement: String!
    typesAssurance: [String!]!
    zonesCouverture: ZoneCouvertureInput!
    garantiesProposees: String!
  }

  input ZoneCouvertureInput {
    departements: [String!]
    regions: [String!]
    codesPostaux: [String!]
  }

  input AccountInput {
    email: String!
    password: String!
  }
`;
