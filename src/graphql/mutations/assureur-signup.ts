import { gql } from 'graphql-tag';

export const ASSUREUR_SIGNUP_MUTATION = gql`
  mutation AssureurSignup(
    $companyInfo: CompanyInfoInput!
    $contactInfo: ContactInfoInput!
    $accountInfo: AccountInfoInput!
    $kbisFile: Upload
    $insuranceFile: Upload
    $agreementFile: Upload
  ) {
    assureurSignup(
      companyInfo: $companyInfo
      contactInfo: $contactInfo
      accountInfo: $accountInfo
      kbisFile: $kbisFile
      insuranceFile: $insuranceFile
      agreementFile: $agreementFile
    ) {
      tokens {
        token
        refreshToken
        expiresIn
      }
      user {
        id
        email
        type
        profile
      }
    }
  }
`;