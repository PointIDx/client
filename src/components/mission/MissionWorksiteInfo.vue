<template>
  <Card class="shadow-sm border-0 bg-white">
    <CardHeader class="pb-4">
      <CardTitle class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg">
          <MapPin class="w-4 h-4 text-green-600" />
        </div>
        <span class="text-lg font-semibold">Lieu d'intervention</span>
      </CardTitle>
    </CardHeader>
    <CardContent class="pt-0 space-y-3">
      <div v-if="mission.chantierAdresse" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Adresse</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.chantierAdresse }}</div>
      </div>
      <div v-if="mission.chantierVille || mission.chantierCodePostal" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Ville</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.chantierCodePostal }} {{ mission.chantierVille }}</div>
      </div>
      <div v-if="mission.chantierEtage" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Étage</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.chantierEtage }}</div>
      </div>
      <div v-if="mission.chantierTypeAcces" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Type d'accès</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.chantierTypeAcces }}</div>
      </div>
      <Separator v-if="mission.chantierContraintes" class="my-3" />
      <div v-if="mission.chantierContraintes" class="py-2">
        <p class="text-sm font-medium text-gray-600 mb-2">Contraintes d'accès</p>
        <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{ mission.chantierContraintes }}</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MapPin } from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'

interface Props {
  mission: MissionDetails
}

defineProps<Props>()
</script>