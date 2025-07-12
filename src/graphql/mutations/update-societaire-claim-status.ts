import { gql } from 'graphql-tag';

export const UPDATE_SOCIETAIRE_CLAIM_STATUS = gql`
  mutation UpdateSocietaireClaimStatus($input: ClaimStatusUpdateInput!) {
    updateSocietaireClaimStatus(input: $input) {
      id
      dossierNumber
      newStatus
      previousStatus
      comment
      updatedBy
      updatedAt
      timeline {
        id
        date
        status
        description
        updatedBy
        comment
      }
    }
  }
`;