<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Briefcase class="h-5 w-5" />
        Détails Complets de la Mission
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div v-if="mission.description">
        <p class="text-sm font-medium text-gray-600 mb-2">Description complète</p>
        <p class="text-sm text-gray-900 bg-gray-50 p-4 rounded-md">{{ mission.description }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="mission.materiaux">
          <p class="text-sm font-medium text-gray-600 mb-2">Matériaux requis</p>
          <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{ mission.materiaux }}</p>
        </div>
        <div v-if="mission.normes">
          <p class="text-sm font-medium text-gray-600 mb-2">Normes à respecter</p>
          <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{ mission.normes }}</p>
        </div>
      </div>

      <div v-if="mission.conditionsParticulieres">
        <p class="text-sm font-medium text-gray-600 mb-2">Conditions particulières</p>
        <p class="text-sm text-gray-900 bg-gray-50 p-4 rounded-md">{{ mission.conditionsParticulieres }}</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase } from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'

interface Props {
  mission: MissionDetails
}

defineProps<Props>()
</script>