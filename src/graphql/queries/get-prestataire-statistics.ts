import { gql } from '@apollo/client/core'

export const GET_PRESTATAIRE_STATISTICS_QUERY = gql`
  query GetPrestataireStatistics {
    getPrestataireStatistics {
      totalMissions
      completedMissions
      pendingMissions
      acceptanceRate
      averageRating
      totalEarnings
      monthlyEarnings
      missionsThisMonth
      missionsThisWeek
      upcomingMissions
      overduePayments
    }
  }
`

export interface PrestataireStatistics {
  totalMissions: number
  completedMissions: number
  pendingMissions: number
  acceptanceRate: number
  averageRating: number
  totalEarnings: number
  monthlyEarnings: number
  missionsThisMonth: number
  missionsThisWeek: number
  upcomingMissions: number
  overduePayments: number
}