<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Star } from 'lucide-vue-next'

interface Props {
  open: boolean
  prestataireInfo?: {
    companyName: string
    contactPerson: string
  }
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'submit': [rating: { rating: number; comment: string }]
}>()

const rating = ref(0)
const comment = ref('')
const hoveredRating = ref(0)

const isValid = computed(() => rating.value > 0)

const setRating = (value: number) => {
  rating.value = value
}

const handleMouseEnter = (value: number) => {
  hoveredRating.value = value
}

const handleMouseLeave = () => {
  hoveredRating.value = 0
}

const getStarClass = (starIndex: number) => {
  const currentRating = hoveredRating.value || rating.value
  return starIndex <= currentRating
    ? 'text-yellow-400 fill-yellow-400'
    : 'text-gray-300'
}

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      rating: rating.value,
      comment: comment.value.trim()
    })
  }
}

const handleClose = () => {
  emit('update:open', false)
  // Reset form when closing
  rating.value = 0
  comment.value = ''
  hoveredRating.value = 0
}

const getRatingText = (value: number) => {
  const texts = {
    1: 'Très insatisfaisant',
    2: 'Insatisfaisant', 
    3: 'Correct',
    4: 'Satisfaisant',
    5: 'Excellent'
  }
  return texts[value as keyof typeof texts] || ''
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <Star class="w-5 h-5 text-yellow-400" />
          <span>Évaluer le prestataire</span>
        </DialogTitle>
        <DialogDescription>
          <span v-if="prestataireInfo">
            Évaluez le travail de <strong>{{ prestataireInfo.companyName }}</strong>
            ({{ prestataireInfo.contactPerson }}) pour cette mission.
          </span>
          <span v-else>
            Évaluez la qualité du travail réalisé par le prestataire.
          </span>
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Star Rating -->
        <div class="space-y-3">
          <Label>Note (obligatoire)</Label>
          <div class="flex items-center space-x-1">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="p-1 hover:scale-110 transition-transform"
              @click="setRating(star)"
              @mouseenter="handleMouseEnter(star)"
              @mouseleave="handleMouseLeave"
            >
              <Star 
                class="w-8 h-8 transition-colors"
                :class="getStarClass(star)"
              />
            </button>
          </div>
          
          <!-- Rating description -->
          <div v-if="rating > 0" class="text-sm text-gray-600">
            {{ getRatingText(rating) }}
          </div>
        </div>

        <!-- Comment -->
        <div class="space-y-2">
          <Label for="rating-comment">Commentaire (optionnel)</Label>
          <Textarea
            id="rating-comment"
            v-model="comment"
            placeholder="Décrivez votre expérience avec ce prestataire (qualité du travail, respect des délais, communication, etc.)"
            rows="4"
            class="resize-none"
          />
          <div class="text-xs text-gray-500">
            Ce commentaire aidera les autres assureurs à choisir ce prestataire.
          </div>
        </div>
      </div>

      <DialogFooter class="flex space-x-2">
        <Button 
          variant="outline" 
          @click="handleClose"
          :disabled="loading"
        >
          Annuler
        </Button>
        <Button 
          @click="handleSubmit"
          :disabled="!isValid || loading"
          class="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <Star class="w-4 h-4 mr-2" />
          {{ loading ? 'Envoi en cours...' : 'Évaluer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>