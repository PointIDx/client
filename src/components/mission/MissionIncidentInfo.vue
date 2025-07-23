<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <AlertTriangle class="h-5 w-5" />
        Informations Sinistre
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <div v-if="mission.sinistreType" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Type de sinistre</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.sinistreType }}</div>
      </div>
      <div v-if="mission.numeroSinistre" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Numéro de sinistre</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.numeroSinistre }}</div>
      </div>
      <div v-if="mission.sinistreUrgence" class="flex items-center justify-between py-2">
        <span class="text-sm font-medium text-gray-600">Niveau d'urgence</span>
        <Badge variant="outline" :class="urgenceBadge?.class">
          {{ mission.sinistreUrgence }}
        </Badge>
      </div>
      <div v-if="mission.sinistreDateSinistre" class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Calendar class="h-4 w-4" />
          Date du sinistre
        </div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.sinistreDateSinistre }}</div>
      </div>
      <div v-if="mission.sinistreDateIntervention" class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Calendar class="h-4 w-4" />
          Date d'intervention
        </div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.sinistreDateIntervention }}</div>
      </div>
      <Separator v-if="mission.sinistreDescription" class="my-3" />
      <div v-if="mission.sinistreDescription" class="py-2">
        <p class="text-sm font-medium text-gray-600 mb-2">Description</p>
        <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{ mission.sinistreDescription }}</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Calendar } from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'

interface Props {
  mission: MissionDetails
}

const props = defineProps<Props>()

const urgenceBadge = computed(() => {
  if (!props.mission) return null
  const urgence = props.mission.urgence
  const urgenceMap: Record<string, { text: string; class: string }> = {
    'BASSE': { text: 'Basse', class: 'bg-green-100 text-green-800' },
    'MOYENNE': { text: 'Moyenne', class: 'bg-yellow-100 text-yellow-800' },
    'HAUTE': { text: 'Haute', class: 'bg-orange-100 text-orange-800' },
    'CRITIQUE': { text: 'Critique', class: 'bg-red-100 text-red-800' }
  }
  return urgenceMap[urgence] || { text: urgence, class: 'bg-gray-100 text-gray-800' }
})
</script>