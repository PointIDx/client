<template>
  <div class="mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Mission #{{ mission?.reference || missionId }}</h1>
        <p class="text-muted-foreground text-lg">{{ mission?.titre || mission?.description }}</p>
        <p class="text-sm text-gray-500">Créée le {{ mission ? formatDate(mission.dateDeCreation) : '' }}</p>
      </div>
      <div class="flex items-center gap-4">
        <Badge v-if="statusBadge" variant="outline" :class="`${statusBadge.class} px-3 py-1 text-sm`">
          {{ statusBadge.text }}
        </Badge>
        <Button variant="outline" size="sm">
          <Edit class="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button @click="onGoBack" variant="outline" size="sm">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, ArrowLeft } from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'
import { getMissionStatusBadge } from '@/utils/status-badges'

interface Props {
  mission: MissionDetails | null
  missionId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'go-back': []
}>()

const statusBadge = computed(() => {
  if (!props.mission) return null
  return getMissionStatusBadge(props.mission.status)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const onGoBack = () => {
  emit('go-back')
}
</script>