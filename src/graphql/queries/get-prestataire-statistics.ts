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
      upcomingMissions {
        id
        reference
        title
        deadline
        estimatedCost
      }
      overduePayments {
        missionId
        amount
        dueDate
        daysOverdue
      }
    }
  }
`