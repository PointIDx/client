<template>
  <Card class="hover:shadow-lg transition-shadow" :data-testid="dataTestId">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div>
          <CardTitle class="text-lg">{{ mission.title }}</CardTitle>
          <CardDescription class="text-sm">{{ mission.reference }}</CardDescription>
        </div>
        <Badge :class="statusBadge.class" :variant="statusBadge.variant">
          <component :is="statusBadge.icon" class="w-3 h-3 mr-1" />
          {{ statusBadge.text }}
        </Badge>
      </div>
    </CardHeader>
    
    <CardContent class="space-y-3">
      <div class="flex items-center space-x-2">
        <MapPin class="w-4 h-4 text-gray-500" />
        <span class="text-sm text-gray-600">{{ mission.address }}</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <User class="w-4 h-4 text-gray-500" />
        <span class="text-sm">{{ mission.contactName }}</span>
      </div>
      
      <div v-if="mission.urgency && urgencyBadge" class="flex items-center space-x-2">
        <component :is="urgencyBadge.icon" class="w-4 h-4 text-gray-500" />
        <Badge :class="urgencyBadge.class" size="sm">
          {{ urgencyBadge.text }}
        </Badge>
      </div>
      
      <div v-if="mission.description" class="text-sm text-gray-600 line-clamp-2">
        {{ mission.description }}
      </div>
      
      <div class="flex items-center space-x-2 pt-2">
        <Button 
          v-if="showDetailsButton"
          variant="outline" 
          size="sm" 
          class="flex-1 bg-transparent" 
          :data-testid="`${dataTestId}-details-button`"
          @click="$emit('showDetails', mission)"
        >
          <Eye class="w-4 h-4 mr-1" />
          Détails
        </Button>
        
        <Button 
          v-if="showChatButton"
          size="sm" 
          class="flex-1" 
          :data-testid="`${dataTestId}-chat-button`"
          @click="$emit('showChat', mission)"
        >
          <MessageCircle class="w-4 h-4 mr-1" />
          Chat
        </Button>
        
        <slot name="actions" :mission="mission" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, User, Eye, MessageCircle } from 'lucide-vue-next'
import { getUrgencyBadge } from '@/utils/status-badges'
import type { StatusBadgeConfig } from '@/utils/status-badges'

export interface MissionCardData {
  id: string
  title: string
  reference: string
  address: string
  contactName: string
  description?: string
  urgency?: string
  status: string
}

interface Props {
  mission: MissionCardData
  statusBadge: StatusBadgeConfig
  showDetailsButton?: boolean
  showChatButton?: boolean
  dataTestId?: string
}

const props = withDefaults(defineProps<Props>(), {
  showDetailsButton: true,
  showChatButton: true,
  dataTestId: 'mission-card'
})

const urgencyBadge = computed(() => 
  props.mission.urgency ? getUrgencyBadge(props.mission.urgency) : null
)

defineEmits<{
  showDetails: [mission: MissionCardData]
  showChat: [mission: MissionCardData]
}>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>