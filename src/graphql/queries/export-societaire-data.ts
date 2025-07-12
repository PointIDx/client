import { gql } from 'graphql-tag';

export const EXPORT_SOCIETAIRE_DATA = gql`
  query ExportSocietaireData($input: SocietaireExportInput!) {
    exportSocietaireData(input: $input) {
      url
      filename
      contentType
      size
      expiresAt
      downloadCount
      maxDownloads
    }
  }
`;