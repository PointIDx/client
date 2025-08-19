import { gql } from '@apollo/client/core'

export const EXPORT_PRESTATAIRE_MISSIONS_QUERY = gql`
  query ExportPrestataireMissions($filters: PrestataireExportFilters, $format: ExportFormat!) {
    exportPrestataireMissions(filters: $filters, format: $format) {
      url
      filename
      contentType
    }
  }
`

export const EXPORT_PRESTATAIRE_REPORT_QUERY = gql`
  query ExportPrestataireReport($period: ReportPeriod!, $format: ExportFormat!) {
    exportPrestataireReport(period: $period, format: $format) {
      url
      filename
      contentType
    }
  }
`

export interface PrestataireExportFilters {
  statut?: string
  dateDebut?: string
  dateFin?: string
  assureurId?: string
  type?: string
}

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year'
export type ExportFormat = 'PDF' | 'Excel' | 'CSV'

export interface ExportResponse {
  url: string
  filename: string
  contentType: string
}