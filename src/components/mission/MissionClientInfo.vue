<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <User class="h-5 w-5" />
        Informations Client
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <div v-if="mission.civilite || mission.nom || mission.prenom" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Nom complet</div>
        <div class="text-sm text-gray-900 font-medium">
          {{ mission.civilite }} {{ mission.prenom }} {{ mission.nom }}
        </div>
      </div>
      <div v-if="mission.telephone" class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Phone class="h-4 w-4" />
          Téléphone
        </div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.telephone }}</div>
      </div>
      <div v-if="mission.email" class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Mail class="h-4 w-4" />
          Email
        </div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.email }}</div>
      </div>
      <Separator v-if="mission.adresse || mission.ville" class="my-3" />
      <div v-if="mission.adresse" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Adresse</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.adresse }}</div>
      </div>
      <div v-if="mission.ville || mission.codePostal" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Ville</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.codePostal }} {{ mission.ville }}</div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Phone, Mail } from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'

interface Props {
  mission: MissionDetails
}

defineProps<Props>()
</script>