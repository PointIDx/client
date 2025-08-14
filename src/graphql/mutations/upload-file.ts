import { gql } from 'graphql-tag';

export const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($input: FileUploadInput!) {
    uploadFile(input: $input) {
      id
      ownerId
      relatedEntityId
      relatedEntityType
      filename
      originalFilename
      fileType
      fileSize
      storagePath
      documentType
      uploadedAt
      isPublic
      metadata
    }
  }
`;

export const UPLOAD_SOCIETAIRE_FILE_MUTATION = gql`
  mutation UploadSocietaireFile($input: SocietaireDocumentUploadInput!) {
    uploadSocietaireFile(input: $input) {
      id
      dossierNumber
      filename
      originalName
      url
      contentType
      size
      category
      description
      uploadDate
      uploadedBy
      status
      metadata
    }
  }
`;

export const UPLOAD_MISSION_FILE_MUTATION = gql`
  mutation UploadMissionFile($input: MissionDocumentInput!) {
    uploadMissionFile(input: $input) {
      id
      filename
      url
      contentType
      size
      uploadDate
      description
      uploadedBy
    }
  }
`;