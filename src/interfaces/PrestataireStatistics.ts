export interface PrestataireStatistics {
  totalMissions: number;
  completedMissions: number;
  pendingMissions: number;
  acceptanceRate: number;
  averageRating: number;
  totalEarnings: number;
  monthlyEarnings: number;
  missionsThisMonth: number;
  missionsThisWeek: number;
  upcomingMissions: Array<{
    id: string;
    reference: string;
    title: string;
    deadline?: string;
    estimatedCost?: number;
  }>;
  overduePayments: Array<{
    missionId: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  }>;
}