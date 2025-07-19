<template>
  <div class="flex items-center space-x-2">
    <!-- Star Rating Display -->
    <div class="flex items-center space-x-1">
      <Star
        v-for="star in 5"
        :key="star"
        :class="getStarClass(star)"
        class="w-4 h-4"
        :fill="star <= Math.round(rating) ? 'currentColor' : 'none'"
      />
    </div>
    
    <!-- Rating Number -->
    <span class="text-sm font-medium text-gray-700">
      {{ rating.toFixed(1) }}
    </span>
    
    <!-- Mission Count (if provided) -->
    <span v-if="missionCount" class="text-xs text-gray-500">
      ({{ missionCount }} {{ missionCount === 1 ? 'mission' : 'missions' }})
    </span>
    
    <!-- Rating Status Badge -->
    <Badge v-if="showBadge" :class="getRatingBadgeClass()">
      {{ getRatingText() }}
    </Badge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'

interface Props {
  rating: number
  missionCount?: number
  showBadge?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  rating: 0,
  showBadge: false,
  size: 'md'
})

const getStarClass = (starIndex: number) => {
  const filled = starIndex <= Math.round(props.rating)
  
  if (filled) {
    if (props.rating >= 4.5) return 'text-yellow-400'
    if (props.rating >= 3.5) return 'text-yellow-500'
    if (props.rating >= 2.5) return 'text-orange-400'
    return 'text-red-400'
  }
  
  return 'text-gray-300'
}

const getRatingBadgeClass = () => {
  if (props.rating >= 4.5) return 'bg-green-100 text-green-800'
  if (props.rating >= 3.5) return 'bg-yellow-100 text-yellow-800'
  if (props.rating >= 2.5) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

const getRatingText = () => {
  if (props.rating >= 4.5) return 'Excellent'
  if (props.rating >= 3.5) return 'Très bien'
  if (props.rating >= 2.5) return 'Bien'
  if (props.rating >= 1.5) return 'Moyen'
  return 'Faible'
}
</script>