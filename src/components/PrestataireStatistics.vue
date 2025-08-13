<template>
  <div class="statistics-dashboard">
    <h2 class="text-2xl font-bold mb-6">Statistiques et Analytics</h2>
    
    <div v-if="loading" class="loading-spinner">
      Chargement des statistiques...
    </div>
    
    <div v-else-if="error" class="error-message text-red-600">
      Erreur lors du chargement des statistiques: {{ error }}
    </div>
    
    <div v-else-if="statistics" class="statistics-grid">
      <!-- Main Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Total Missions</h3>
          <p class="text-3xl font-bold text-blue-600">{{ statistics.totalMissions }}</p>
        </div>
        
        <div class="stat-card bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Missions Complétées</h3>
          <p class="text-3xl font-bold text-green-600">{{ statistics.completedMissions }}</p>
          <p class="text-sm text-gray-500">Taux: {{ completionRate }}%</p>
        </div>
        
        <div class="stat-card bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Note Moyenne</h3>
          <p class="text-3xl font-bold text-yellow-600">{{ statistics.averageRating.toFixed(1) }}/5</p>
        </div>
        
        <div class="stat-card bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Taux d'Acceptation</h3>
          <p class="text-3xl font-bold text-purple-600">{{ statistics.acceptanceRate }}%</p>
        </div>
      </div>
      
      <!-- Financial Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="stat-card bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4">Revenus</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Total:</span>
              <span class="font-bold text-green-600">{{ formatCurrency(statistics.totalEarnings) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Ce mois:</span>
              <span class="font-bold">{{ formatCurrency(statistics.monthlyEarnings) }}</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4">Activité Récente</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Ce mois:</span>
              <span class="font-bold">{{ statistics.missionsThisMonth }} missions</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Cette semaine:</span>
              <span class="font-bold">{{ statistics.missionsThisWeek }} missions</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">En attente:</span>
              <span class="font-bold">{{ statistics.pendingMissions }} missions</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Upcoming Missions -->
      <div v-if="statistics.upcomingMissions.length > 0" class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 class="text-lg font-semibold mb-4">Missions Prochaines</h3>
        <div class="space-y-3">
          <div v-for="mission in statistics.upcomingMissions.slice(0, 5)" :key="mission.id" 
               class="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p class="font-medium">{{ mission.title }}</p>
              <p class="text-sm text-gray-600">Réf: {{ mission.reference }}</p>
            </div>
            <div class="text-right">
              <p v-if="mission.deadline" class="text-sm text-gray-600">
                {{ formatDate(mission.deadline) }}
              </p>
              <p v-if="mission.estimatedCost" class="font-medium">
                {{ formatCurrency(mission.estimatedCost) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Overdue Payments -->
      <div v-if="statistics.overduePayments.length > 0" class="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <h3 class="text-lg font-semibold mb-4 text-red-600">Paiements en Retard</h3>
        <div class="space-y-3">
          <div v-for="payment in statistics.overduePayments" :key="payment.missionId" 
               class="flex justify-between items-center p-3 bg-red-50 rounded">
            <div>
              <p class="font-medium">Mission {{ payment.missionId }}</p>
              <p class="text-sm text-red-600">{{ payment.daysOverdue }} jours de retard</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-red-600">{{ formatCurrency(payment.amount) }}</p>
              <p class="text-sm text-gray-600">Échéance: {{ formatDate(payment.dueDate) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="!hasData" class="bg-white p-8 rounded-lg shadow-md text-center">
        <p class="text-gray-500">Aucune donnée statistique disponible pour le moment.</p>
        <p class="text-sm text-gray-400">Commencez à accepter des missions pour voir vos statistiques.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { GET_PRESTATAIRE_STATISTICS_QUERY } from '@/graphql/queries/get-prestataire-statistics'
import type { PrestataireStatistics } from '@/interfaces/PrestataireStatistics'

const { result, loading, error, refetch } = useQuery(GET_PRESTATAIRE_STATISTICS_QUERY)

const statistics = computed(() => result.value?.getPrestataireStatistics as PrestataireStatistics | null)

const completionRate = computed(() => {
  if (!statistics.value || statistics.value.totalMissions === 0) return 0
  return Math.round((statistics.value.completedMissions / statistics.value.totalMissions) * 100)
})

const hasData = computed(() => {
  return statistics.value && (
    statistics.value.totalMissions > 0 ||
    statistics.value.upcomingMissions.length > 0 ||
    statistics.value.overduePayments.length > 0
  )
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  refetch()
})
</script>

<style scoped>
.statistics-dashboard {
  @apply p-6;
}

.stat-card {
  @apply transition-shadow duration-200;
}

.stat-card:hover {
  @apply shadow-lg;
}

.loading-spinner {
  @apply flex justify-center items-center py-12 text-gray-500;
}

.error-message {
  @apply bg-red-50 border border-red-200 rounded-lg p-4;
}
</style>