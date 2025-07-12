import { gql } from 'graphql-tag';

export const UPLOAD_SOCIETAIRE_DOCUMENT = gql`
  mutation UploadSocietaireDocument($input: SocietaireDocumentInput!) {
    uploadSocietaireDocument(input: $input) {
      id
      dossierNumber
      fileName
      originalName
      url
      contentType
      size
      category
      description
      uploadDate
      uploadedBy
      status
      metadata {
        key
        value
      }
    }
  }
`;