import { gql } from '@apollo/client/core'

export const EXPORT_MISSIONS_QUERY = gql`
  query ExportMissions($filters: ExportFilters, $format: ExportFormat!) {
    exportMissions(filters: $filters, format: $format) {
      url
      filename
      contentType
    }
  }
`

export const EXPORT_MISSION_DETAILS_QUERY = gql`
  query ExportMissionDetails($missionId: String!, $format: ExportFormat!) {
    exportMissionDetails(missionId: $missionId, format: $format) {
      url
      filename
      contentType
    }
  }
`

export interface ExportFilters {
  statut?: string
  prestataireId?: string
  urgence?: string
  type?: string
  dateDebut?: string
  dateFin?: string
}

export type ExportFormat = 'pdf' | 'excel' | 'csv'

export interface ExportResponse {
  url: string
  filename: string
  contentType: string
}