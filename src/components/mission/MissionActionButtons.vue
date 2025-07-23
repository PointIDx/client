<template>
  <div class="flex flex-wrap items-center gap-3 mt-6">
    <!-- Prestataire Actions -->
    <Button v-if="availableActions.includes('accept')" size="sm"
            @click="$emit('accept-mission')" 
            class="bg-green-600 hover:bg-green-700 text-white">
      <CheckCircle class="w-4 h-4 mr-2" />
      Accepter la mission
    </Button>
    
    <Button v-if="availableActions.includes('refuse')" size="sm"
            @click="$emit('refuse-mission', 'Mission refusée par le prestataire')"  
            class="!bg-red-600 text-white hover:bg-red-700"
            variant="destructive">
      <XCircle class="w-4 h-4 mr-2" />
      Refuser la mission
    </Button>
    
    <Button v-if="availableActions.includes('start')" size="sm"
            @click="$emit('start-mission')" 
            class="bg-blue-600 hover:bg-blue-700 text-white">
      <Clock class="w-4 h-4 mr-2" />
      Démarrer la mission
    </Button>
    
    <Button v-if="availableActions.includes('complete')" 
            @click="$emit('complete-mission', 'Mission terminée avec succès')" size="sm"
            class="bg-green-600 hover:bg-green-700 text-white">
      <CheckCircle class="w-4 h-4 mr-2" />
      Terminer la mission
    </Button>

    <!-- Assureur Actions -->
    <Button v-if="availableActions.includes('suspend')" size="sm"
            @click="$emit('suspend-mission', 'Mission suspendue par l\'assureur')" 
            class="bg-orange-600 hover:bg-orange-700 text-white">
      <AlertTriangle class="w-4 h-4 mr-2" />
      Suspendre
    </Button>
    
    <Button v-if="availableActions.includes('resume')" size="sm"
            @click="$emit('resume-mission')" 
            class="bg-blue-600 hover:bg-blue-700 text-white">
      <Clock class="w-4 h-4 mr-2" />
      Reprendre
    </Button>
    
    <Button v-if="availableActions.includes('validate')" 
            @click="$emit('validate-mission')" 
            class="bg-green-600 hover:bg-green-700 text-white">
      <CheckCircle class="w-4 h-4 mr-2" />
      Valider la mission
    </Button>
    
    <Button v-if="availableActions.includes('rate')" 
            @click="$emit('rate-mission')" 
            class="bg-yellow-500 hover:bg-yellow-600 text-white">
      <Star class="w-4 h-4 mr-2" />
      Évaluer le prestataire
    </Button>

    <!-- Common Actions -->
    <Button v-if="availableActions.includes('cancel')" 
            @click="$emit('cancel-mission')" size="sm"  
            class="!bg-red-600 text-white hover:bg-red-700">
      <XCircle class="w-4 h-4 mr-2" />
      Annuler
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Star 
} from 'lucide-vue-next'

interface Props {
  availableActions: string[]
}

defineProps<Props>()

defineEmits<{
  'accept-mission': []
  'refuse-mission': [reason: string]
  'start-mission': []
  'complete-mission': [message: string]
  'suspend-mission': [reason: string]
  'resume-mission': []
  'validate-mission': []
  'rate-mission': []
  'cancel-mission': []
}>()
</script>