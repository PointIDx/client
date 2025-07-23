<template>
  <Dialog :open="isOpen" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Noter la mission</DialogTitle>
        <DialogDescription>
          Donnez votre avis sur cette mission pour aider à améliorer nos services.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-6 py-4">
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700 mb-3">Quelle note donnez-vous à cette mission ?</p>
          <div class="flex gap-1 justify-center">
            <button
              v-for="star in [1, 2, 3, 4, 5]"
              :key="star"
              type="button"
              class="focus:outline-none"
              @click="handleRatingChange(star)"
              @mouseenter="handleRatingHover(star)"
              @mouseleave="handleRatingHover(0)"
            >
              <Star
                :class="`h-8 w-8 ${
                  star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`"
              />
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">{{ getRatingText(rating) }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 mb-2 block">Commentaire (optionnel)</label>
          <Textarea
            :model-value="ratingComment"
            @update:model-value="(value: string) => $emit('update:comment', value)"
            placeholder="Partagez votre expérience avec cette mission..."
            class="min-h-[100px]"
          />
        </div>

        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="$emit('update:open', false)">
            Annuler
          </Button>
          <Button @click="handleSubmit" class="bg-green-600 hover:bg-green-700">
            Soumettre la note
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  rating: number
  ratingComment: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:rating': [value: number]
  'update:comment': [value: string]
  'submit': [data: { rating: number; comment: string }]
}>()

const hoverRating = ref(0)

const handleRatingChange = (newRating: number) => {
  emit('update:rating', newRating)
}

const handleRatingHover = (hoverValue: number) => {
  hoverRating.value = hoverValue
}

const getRatingText = (rating: number) => {
  const ratingTexts = {
    1: 'Très insatisfait',
    2: 'Insatisfait', 
    3: 'Correct',
    4: 'Satisfait',
    5: 'Très satisfait'
  }
  return ratingTexts[rating as keyof typeof ratingTexts] || ''
}

const handleSubmit = () => {
  if (props.rating === 0) {
    alert('Veuillez sélectionner une note')
    return
  }
  emit('submit', { rating: props.rating, comment: props.ratingComment })
}
</script>